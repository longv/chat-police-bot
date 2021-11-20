# %% Imports
import json
import numpy as np
import pandas as pd
# %% Keras
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import (
    Dense, Input, LSTM, Embedding, Dropout,
    # Activation
)
from tensorflow.keras.layers import Bidirectional, GlobalMaxPool1D
from tensorflow.keras.models import Model
# %%
import tensorflowjs as tfjs
# from tensorflow.keras import initializers, regularizers, constraints, optimizers, layers
# %% Words coefficient
def get_coefs(word,*args):
    return word, np.asarray(args, dtype='float32')
# %% Paths
PATH = "../dataset/kaggle_toxic_comments/"
GLOVE_FILE = f"{PATH}glove.6B.50d.txt"
TRAIN_FILE = f"{PATH}train.csv"
TEST_FILE = f"{PATH}test.csv"
TEST_LABEL_FILE = f"{PATH}test_labels.csv"
# %% Hyperparameters
EMBED_SIZE = 50 # how big is each word vector
MAX_FEATURES = 20000 # how many unique words to use (i.e num rows in embedding vector)
MAX_LEN = 100 # max number of words in a comment to use
# %% Read files
df_train = pd.read_csv(TRAIN_FILE)
df_test = pd.read_csv(TEST_FILE)
# %%
## Training texts and labels
list_sentences_train = df_train["comment_text"].fillna("_na_").values
list_classes = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"]
y = df_train[list_classes].values
## Test texts
list_sentences_test = df_test["comment_text"].fillna("_na_").values
# %% Tokenize words
tokenizer = Tokenizer(num_words=MAX_FEATURES)
tokenizer.fit_on_texts(list(list_sentences_train))
list_tokenized_train = tokenizer.texts_to_sequences(list_sentences_train)
list_tokenized_test = tokenizer.texts_to_sequences(list_sentences_test)
X_t = pad_sequences(list_tokenized_train, maxlen=MAX_LEN)
X_te = pad_sequences(list_tokenized_test, maxlen=MAX_LEN)
# %%
embeddings_index = dict(get_coefs(
    *o.strip().split()
) for o in open(GLOVE_FILE))
# %%
all_embs = np.stack(embeddings_index.values())
emb_mean,emb_std = all_embs.mean(), all_embs.std()
# %%
word_index = tokenizer.word_index
nb_words = min(MAX_FEATURES, len(word_index))
embedding_matrix = np.random.normal(emb_mean, emb_std, (nb_words, EMBED_SIZE))
for word, i in word_index.items():
    if i >= MAX_FEATURES:
        continue
    embedding_vector = embeddings_index.get(word)
    if embedding_vector is not None:
        embedding_matrix[i] = embedding_vector
# %% Iteration 1
# inp = Input(shape=(MAX_LEN,))
# x = Embedding(MAX_FEATURES, EMBED_SIZE, weights=[embedding_matrix])(inp)
# x = Bidirectional(LSTM(50, return_sequences=True, dropout=0.1, recurrent_dropout=0.1))(x)
# x = GlobalMaxPool1D()(x)
# x = Dense(50, activation="relu")(x)
# x = Dropout(0.1)(x)
# x = Dense(6, activation="sigmoid")(x)
# model = Model(inputs=inp, outputs=x)
# model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
# %% Iteration 2
inp = Input(shape=(MAX_LEN,))
x = Embedding(MAX_FEATURES, EMBED_SIZE, weights=[embedding_matrix])(inp)
x = Bidirectional(LSTM(40, return_sequences=True, dropout=0.1, recurrent_dropout=0.1))(x)
x = GlobalMaxPool1D()(x)
x = Dense(70, activation="relu")(x)
x = Dropout(0.1)(x)
x = Dense(6, activation="sigmoid")(x)
model = Model(inputs=inp, outputs=x)
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
# %%
model.fit(X_t, y, batch_size=32, epochs=2, validation_split=0.1)
# %%
y_test = model.predict([X_te], batch_size=1024, verbose=1)
# %%
df_test_label = pd.read_csv(TEST_LABEL_FILE)
# %%
df_test_label.head()
# %%
model.evaluate([X_te], df_test_label[list_classes].values, batch_size=2048, verbose=1)
# %%
test_text = "rengar and guardian are a gay dou if you insist"
test_sequence = pad_sequences(tokenizer.texts_to_sequences([test_text]), maxlen=MAX_LEN)
model.predict(test_sequence)
# %%
model.save("./model/toxic_gauge.h5")
# %%
tfjs.converters.save_keras_model(model, "./model/toxic_gauge")
# %%
f = open("./model/toxic_gauge/tokenizer.json", "w")
f.write(json.dumps(tokenizer.word_index, indent=4))
f.close()
# tokenizer.to_json()
# %%
