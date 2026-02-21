declare module 'highlight.js/lib/core' {
    import hljs from 'highlight.js';
    export default hljs;
}

declare module 'highlight.js/lib/languages/xml' {
    export default function(hljs: any): any;
}

declare module '@ballerina/highlightjs-ballerina' {
    const ballerina: any;
    export default ballerina;
}
