from setuptools import setup

PACKAGES = ['black', 'numpy', 'pandas', 'tensorflow==2.4.1', 'rasa', 'rasa_sdk']

setup(
    name='junction2021',
    version='0.1.0',
    packages=PACKAGES,
    url='https://github.com/longv/chat-police-bot',
    license='GPLv3',
    author='mu7tr',
    author_email='',
    description='chat-police-bot'
)
