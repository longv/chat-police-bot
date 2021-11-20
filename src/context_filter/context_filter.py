import spacy
import en_core_web_sm


# Base setup to get
# Level 1 get it working by seeing basic text from file
# Level 2 no idea
# Level 3 use language model to get the context

class ContextFilter:
    def __init__(self,
                 analysis_type='',
                 nlp=None,
                 language='en',
                 ):
        self.language = language
        self.analysis_type = analysis_type
        self.nlp = nlp

    def get_context_level1(self, text):
        pass

    def get_context_level2(self, text):
        pass

    def get_context_level3(self, text):
        if self.language == 'en':
            self.nlp = en_core_web_sm.load()
        else:
            raise NotImplementedError("This language is currently not implemented")
        nlp_text = self.nlp(text)
        print(nlp_text)
        return nlp_text
