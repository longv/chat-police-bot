import spacy
import random
import pathlib
import en_core_web_sm
import logging

# Base setup to get context/intent
# Level 1 get it working by seeing basic text from file
# Level 2 no idea
# Level 3 use language model with chatbot to get the context. I think I will go straight from 1 to 3
path_base_data = pathlib.Path.cwd() / "context_filter" / "data"
path_stoptalk_words = path_base_data / "en_stoptalk_words.txt"
path_performance_words = path_base_data / "en_performance_words.txt"
path_stoptalk_fixphrases = path_base_data / "en_stoptalk_fixphrases.txt"


class ContextFilter:
    def __init__(
        self,
        analysis_type="",
        nlp=None,
        language="en",
    ):
        self.language = language
        self.analysis_type = analysis_type
        self.nlp = nlp

    @staticmethod
    def check_existance_from_wordsfile(filename, text_words):
        """
        Check if text words are present in filename list
        """
        with open(filename) as f:
            single_words = [line.rstrip() for line in f]
            is_from_wordsfile = any(word in text_words for word in single_words)
        return is_from_wordsfile

    @staticmethod
    def get_intent_response(reason):
        response = ""
        if reason == "stop_talking":
            with open(path_stoptalk_fixphrases) as f:
                single_words = [line.rstrip() for line in f]
                response = random.choice(single_words)

        return response

    def get_context_level1(self, text):
        """
        Very basic function to get an idea if the basic flow is working
        """
        intent = dict()
        intent["reason"] = "good"
        split_words = text.split()

        is_stoptalk = self.check_existance_from_wordsfile(filename=path_stoptalk_words, text_words=split_words)
        is_performance = self.check_existance_from_wordsfile(filename=path_performance_words, text_words=split_words)
        if is_stoptalk:
            intent["reason"] = "stop_talking"
        if is_performance:
            intent["reason"] = "bad_performance"
        response = self.get_intent_response(reason=intent["reason"])
        print(
            f"Suggested response for user: {response} instead of original: {text} which might get you muted or banned"
        )

    def get_context_level2(self, text):
        pass

    def get_context_level3(self, text):
        if self.language == "en":
            self.nlp = en_core_web_sm.load()
        else:
            raise NotImplementedError("This language is currently not implemented")
        nlp_text = self.nlp(text)
        print(nlp_text)
        return nlp_text
