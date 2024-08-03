# Chit Jr.!

Yes, it's the all-new pocket-sized version of [Chit](https://github.com/Fortyseven/chit) -- the privacy-obsessed LLM chat interface, that now lives inside your browser!

-   Run one of several system prompts over the selected text on a webpage.

    -   Summarize

    -   ELI5 (Explain Like I'm 5)

    -   Translate to English

    -   Analysis

    -   ...and more... _or use your own prompt!_

-   Ask follow-up questions.

-   Copy results to the clipboard

-   Uses the [Ollama](https://ollama.com/) LLM server running on your local machine.

## IMPORTANT

- This is a work in progress.

- If you are having trouble connecting, check if Ollama can be accessed from localhost. Set `OLLAMA_ORIGINS` appropriately. Setting it to `*` is not recommended for security reasons, but is fine for testing to make sure things work. This is probably because I'm calling `localhost:11434` instead of `127.0.0.1:11434` by default. I should probably change that. Why am I write this instead of doing it? Because I'm trying to stay on track with other stuff I need to do, and this is how I get distracted.

## Notes

-   Currently built for Firefox, but other browsers are probable once things get stable.
