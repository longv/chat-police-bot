# Challenge uniting empathy and gaming
https://www.junction2021.com/challenges/supercell

## Functionality design
https://drive.google.com/file/d/19jy3iuoWvuxDXbHTBgmsa2lzMeeQSRis/view?pli=1

### Model 1 - Toxicity classification

### Model 2 - Context classification
Get context of given sentence and based on that setup response 


Dictionary of words and intents based on below:
Based on
https://www.researchgate.net/figure/TOP15-toxic-words-in-the-LOL-chats-Numbers-include-both-EUNE-and-EUW-servers_tbl1_332776925
https://en.wikipedia.org/wiki/Category:Pejorative_terms_for_women
https://en.wikipedia.org/wiki/List_of_ethnic_slurs_by_ethnicity

```
# Download language package of en
python3 -m spacy download en_core_web_mdCollecting en_core_web_md==2.3.1

```

