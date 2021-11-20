import os
import pathlib
from sys import exit
import argparse
from context_filter.context_filter import ContextFilter


def main():
    parser = argparse.ArgumentParser(description="Context filter console utility")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("-t", "--text", dest="text", help="Test the given text for context")
    group.add_argument("-f", "--file", dest="path", help="Test the given file for context")
    # parser.add_argument('-l', '--language', dest='language', default='en',
    #                     help='Test for context using specified languages (comma separated)')
    parser.add_argument("-o", "--output", dest="output_file", help="Write the censored output to a file")
    parser.add_argument("--show", action="store_true", help="Print the censored text")

    args = parser.parse_args()

    if args.text and args.path:
        parser.print_help()
        exit()

    if args.text:
        text = args.text
    elif args.path:
        with open(args.path) as f:
            text = "".join(f.readlines())
    else:
        text = ""

    cf = ContextFilter()
    print(f"Context level 1 flow")
    check_text = cf.get_context_level1(text)

    print(f"Context level 3 flow")
    check_text = cf.get_context_level3(text)

    if args.output_file:
        with open(args.output_file, "w") as f:
            f.write(check_text)
        print("Censored text written to output file at: " + args.output_file)

    if args.show or args.output_file:
        return


if __name__ == "__main__":
    main()
