# Contributing to the Docs

These docs are generated using [MkDocs](https://www.mkdocs.org/) with the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.

## Getting Started

Clone the repo and change into the docs directory:

```bash
git clone git@github.com:lightningkite/mui-lightning-components.git
cd mui-lightning-components/docs
```

Install mkdocs and the Material theme:

```bash
pip install mkdocs
pip install mkdocs-material
```

Serve the docs locally on port 8000 with hot reloading:

```bash
mkdocs serve
```

## Adding a New Page

To add a new page, create a new markdown file in the `docs` directory, then add it to the `nav` section of `mkdocs.yml`

## Publishing

To deploy changes to the docs:

```bash
mkdocs gh-deploy
```

## Additional Documentation

- [MkDocs Getting Started Guide](https://www.mkdocs.org/getting-started)
- [Material for MkDocs setup documentation](https://squidfunk.github.io/mkdocs-material/setup/changing-the-colors/)
