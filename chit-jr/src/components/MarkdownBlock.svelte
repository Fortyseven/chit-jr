<script>
    import markdownit from "markdown-it";

    export let content = "";

    const md = markdownit({
        html: true,
        linkify: true,
        typographer: true,
    });
</script>

{@html md.render(content).trim()}

<style
    global
    lang="scss"
>
    // see app.css for markdown
</style>
