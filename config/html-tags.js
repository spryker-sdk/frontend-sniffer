const htmlTags = [
    {
        tagName: 'a',
        single: false,
    },

    {
        tagName: 'abbr',
        single: false,
    },

    {
        tagName: 'address',
        single: false,
    },

    {
        tagName: 'area',
        single: true,
    },

    {
        tagName: 'article',
        single: false,
    },

    {
        tagName: 'aside',
        single: false,
    },

    {
        tagName: 'audio',
        single: false,
    },

    {
        tagName: 'b',
        single: false,
    },

    {
        tagName: 'base',
        single: true,
    },

    {
        tagName: 'bdo',
        single: false,
    },

    {
        tagName: 'blockquote',
        single: false,
    },

    {
        tagName: 'body',
        single: false,
    },

    {
        tagName: 'br',
        single: true,
    },

    {
        tagName: 'button',
        single: false,
    },

    {
        tagName: 'canvas',
        single: false,
    },

    {
        tagName: 'caption',
        single: false,
    },

    {
        tagName: 'cite',
        single: false,
    },

    {
        tagName: 'code',
        single: false,
    },

    {
        tagName: 'col',
        single: true,
    },

    {
        tagName: 'colgroup',
        single: false,
    },

    {
        tagName: 'data',
        single: false,
    },

    {
        tagName: 'datalist',
        single: false,
    },

    {
        tagName: 'dd',
        single: false,
    },

    {
        tagName: 'del',
        single: false,
    },

    {
        tagName: 'dfn',
        single: false,
    },

    {
        tagName: 'div',
        single: false,
    },

    {
        tagName: 'dl',
        single: false,
    },

    {
        tagName: 'dt',
        single: false,
    },

    {
        tagName: 'em',
        single: false,
    },

    {
        tagName: 'embed',
        single: true,
    },

    {
        tagName: 'fieldset',
        single: false,
    },

    {
        tagName: 'figcaption',
        single: false,
    },

    {
        tagName: 'dfn',
        single: false,
    },

    {
        tagName: 'figure',
        single: false,
    },

    {
        tagName: 'footer',
        single: false,
    },

    {
        tagName: 'form',
        single: false,
    },

    {
        tagName: 'h1',
        single: false,
    },

    {
        tagName: 'h2',
        single: false,
    },

    {
        tagName: 'h3',
        single: false,
    },

    {
        tagName: 'h4',
        single: false,
    },

    {
        tagName: 'h5',
        single: false,
    },

    {
        tagName: 'h6',
        single: false,
    },

    {
        tagName: 'head',
        single: false,
    },

    {
        tagName: 'header',
        single: false,
    },

    {
        tagName: 'hr',
        single: true,
    },

    {
        tagName: 'html',
        single: false,
    },

    {
        tagName: 'i',
        single: false,
    },

    {
        tagName: 'iframe',
        single: false,
    },

    {
        tagName: 'img',
        single: true,
    },

    {
        tagName: 'input',
        single: true,
    },

    {
        tagName: 'ins',
        single: false,
    },

    {
        tagName: 'kbd',
        single: false,
    },

    {
        tagName: 'label',
        single: false,
    },

    {
        tagName: 'legend',
        single: false,
    },

    {
        tagName: 'li',
        single: false,
    },

    {
        tagName: 'link',
        single: true,
    },

    {
        tagName: 'main',
        single: false,
    },

    {
        tagName: 'map',
        single: false,
    },

    {
        tagName: 'mark',
        single: false,
    },

    {
        tagName: 'meta',
        single: true,
    },

    {
        tagName: 'meter',
        single: false,
    },

    {
        tagName: 'nav',
        single: false,
    },

    {
        tagName: 'noframes',
        single: false,
    },

    {
        tagName: 'noscript',
        single: false,
    },

    {
        tagName: 'object',
        single: false,
    },

    {
        tagName: 'ol',
        single: false,
    },

    {
        tagName: 'option',
        single: false,
    },

    {
        tagName: 'p',
        single: false,
    },

    {
        tagName: 'param',
        single: true,
    },

    {
        tagName: 'pre',
        single: false,
    },

    {
        tagName: 'progress',
        single: false,
    },

    {
        tagName: 'q',
        single: false,
    },

    {
        tagName: 'rp',
        single: false,
    },

    {
        tagName: 'rt',
        single: false,
    },

    {
        tagName: 'ruby',
        single: false,
    },

    {
        tagName: 's',
        single: false,
    },

    {
        tagName: 'samp',
        single: false,
    },

    {
        tagName: 'script',
        single: false,
    },

    {
        tagName: 'section',
        single: false,
    },

    {
        tagName: 'select',
        single: false,
    },

    {
        tagName: 'small',
        single: false,
    },

    {
        tagName: 'source',
        single: true,
    },

    {
        tagName: 'span',
        single: false,
    },

    {
        tagName: 'strong',
        single: false,
    },

    {
        tagName: 'style',
        single: false,
    },

    {
        tagName: 'sub',
        single: false,
    },

    {
        tagName: 'sup',
        single: false,
    },

    {
        tagName: 'svg',
        single: false,
    },

    {
        tagName: 'table',
        single: false,
    },

    {
        tagName: 'tbody',
        single: false,
    },

    {
        tagName: 'td',
        single: false,
    },

    {
        tagName: 'textarea',
        single: false,
    },

    {
        tagName: 'tfoot',
        single: false,
    },

    {
        tagName: 'th',
        single: false,
    },

    {
        tagName: 'thead',
        single: false,
    },

    {
        tagName: 'time',
        single: false,
    },

    {
        tagName: 'title',
        single: false,
    },

    {
        tagName: 'tr',
        single: false,
    },

    {
        tagName: 'track',
        single: true,
    },

    {
        tagName: 'u',
        single: false,
    },

    {
        tagName: 'ul',
        single: false,
    },

    {
        tagName: 'var',
        single: false,
    },

    {
        tagName: 'video',
        single: false,
    },
];

module.exports = {
    htmlTags,
};
