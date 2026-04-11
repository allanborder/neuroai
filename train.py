import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras import layers, models, Input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight

# 1. Paths
train_path = r'C:\Users\Admin\OneDrive\Desktop\brain data\archive\Training'
test_path  = r'C:\Users\Admin\OneDrive\Desktop\brain data\archive\Testing'

# 2. Data Generators — EfficientNet's own preprocessor (keeps pixels in [0,255] range)
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    horizontal_flip=True,
    vertical_flip=True,
    zoom_range=0.2,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.1,
    brightness_range=[0.85, 1.15],
    fill_mode='nearest'
)
test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

train_set = train_datagen.flow_from_directory(
    train_path, target_size=(224, 224), batch_size=32,
    class_mode='categorical', shuffle=True
)
test_set = test_datagen.flow_from_directory(
    test_path, target_size=(224, 224), batch_size=32,
    class_mode='categorical', shuffle=False
)

# 3. Compute class weights to fix Glioma/Meningioma imbalance
print("\n📊 Class indices:", train_set.class_indices)
class_labels = list(train_set.class_indices.keys())
y_train = train_set.classes

class_weights_array = compute_class_weight(
    class_weight='balanced',
    classes=np.unique(y_train),
    y=y_train
)
class_weight_dict = dict(enumerate(class_weights_array))
print("⚖️  Class weights:", {class_labels[k]: round(v, 3) for k, v in class_weight_dict.items()})

# 4. EfficientNetB0 — no include_preprocessing argument (older TF compatibility)
base_model = tf.keras.applications.EfficientNetB0(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

# 5. Build model
inputs = Input(shape=(224, 224, 3))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(512, activation='relu')(x)
x = layers.Dropout(0.5)(x)
x = layers.Dense(128, activation='relu')(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(4, activation='softmax')(x)

model = models.Model(inputs, outputs)

# 6. Phase 1 — Train only top layers
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

model.summary()

callbacks = [
    EarlyStopping(monitor='val_accuracy', patience=5, restore_best_weights=True, verbose=1),
    ModelCheckpoint('brain_tumor_model.h5', monitor='val_accuracy', save_best_only=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, verbose=1, min_lr=1e-7)
]

print("\n🚀 Phase 1: Training top layers...")
history1 = model.fit(
    train_set,
    validation_data=test_set,
    epochs=20,
    callbacks=callbacks,
    class_weight=class_weight_dict
)

# 7. Phase 2 — Fine-tune deeper layers
print("\n🔧 Phase 2: Fine-tuning deeper layers...")
base_model.trainable = True

# Unfreeze last 60 layers
for layer in base_model.layers[:-60]:
    layer.trainable = False

unfrozen = sum(1 for l in base_model.layers if l.trainable)
print(f"   Unfrozen base layers: {unfrozen}")

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=5e-6),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

history2 = model.fit(
    train_set,
    validation_data=test_set,
    epochs=20,
    callbacks=callbacks,
    class_weight=class_weight_dict
)

# 8. Per-class accuracy report
print("\n📋 Per-class evaluation on test set...")
test_set.reset()
y_pred_probs = model.predict(test_set, verbose=1)
y_pred = np.argmax(y_pred_probs, axis=1)
y_true = test_set.classes

from sklearn.metrics import classification_report, confusion_matrix
print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=class_labels, zero_division=0))

print("Confusion Matrix:")
cm = confusion_matrix(y_true, y_pred)
print(cm)
print("Rows = Actual, Columns = Predicted")
print("Classes:", class_labels)

# 9. Best val accuracy summary
best_val_acc = max(
    max(history1.history['val_accuracy']),
    max(history2.history['val_accuracy'])
)
print(f"\n🏆 Best validation accuracy across both phases: {best_val_acc:.4f} ({best_val_acc*100:.2f}%)")
print("✅ Training complete! Best model saved as 'brain_tumor_model.h5'")