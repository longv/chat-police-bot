# %% Imports
import pandas as pd
import numpy as np
#viz
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec 
import seaborn as sns
from wordcloud import WordCloud ,STOPWORDS
from PIL import Image
import matplotlib_venn as venn
# %%
from nltk.corpus import stopwords
# eng_stopwords = set(stopwords.words("english"))

# %%
PATH = "../dataset/kaggle_toxic_comments/"
GLOVE_FILE = f"{PATH}glove.6B.50d.txt"
TRAIN_FILE = f"{PATH}train.csv"
TEST_FILE = f"{PATH}test.csv"
TEST_LABEL_FILE = f"{PATH}test_labels.csv"
# %%
df_train = pd.read_csv(TRAIN_FILE)
df_test = pd.read_csv(TEST_FILE)
# %%
df_train.head(50)
# %%
df_train.describe()
# %%
# %matplotlib inline
print("Check for missing values in Train dataset")
null_check=df_train.isnull().sum()
print(null_check)
print("Check for missing values in Test dataset")
null_check=df_train.isnull().sum()
print(null_check)
print("filling NA with \"unknown\"")
df_train["comment_text"].fillna("unknown", inplace=True)
df_test["comment_text"].fillna("unknown", inplace=True)
# %%
x=df_train.iloc[:,2:].sum()
#marking comments without any tags as "clean"
rowsums=df_train.iloc[:,2:].sum(axis=1)
df_train['clean']=(rowsums==0)
#count number of clean entries
df_train['clean'].sum()
print("Total comments = ",len(df_train))
print("Total clean comments = ",df_train['clean'].sum())
print("Total tags =",x.sum())
# %%
x=df_train.iloc[:,2:].sum()
#plot
plt.figure(figsize=(8,4))
ax= sns.barplot(x.index, x.values, alpha=0.8)
plt.title("# per class")
plt.ylabel('# of Occurrences', fontsize=12)
plt.xlabel('Type ', fontsize=12)
#adding the text labels
rects = ax.patches
labels = x.values
for rect, label in zip(rects, labels):
    height = rect.get_height()
    ax.text(rect.get_x() + rect.get_width()/2, height + 5, label, ha='center', va='bottom')

plt.show()
# %%
temp_df=df_train.iloc[:,2:-1]
# filter temp by removing clean comments
# temp_df=temp_df[~train.clean]

corr=temp_df.corr()
plt.figure(figsize=(10,8))
sns.heatmap(corr,
            xticklabels=corr.columns.values,
            yticklabels=corr.columns.values, annot=True)
# %%
