import postcss from 'postcss';
import test    from 'ava';

import plugin from './';

function run(t, input, output, opts = { }) {
    return postcss([ plugin(opts) ]).process(input)
        .then( result => {
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, 0);
        });
}

const optDefault = {
    filterByProps: ['color', 'border-color']
};

test('default settings', t => {
    let input = `.foo {
        color: #000;
        width: 10px;
        display: block;
    }`;
    let output = `:root {
        --color-1: #000;
        --width-1: 10px;
        --display-1: block;\n}\n.foo {
        color: var(--color-1);
        width: var(--width-1);
        display: var(--display-1);
    }`;
    return run(t, input, output, { });
});


test('repeated values', t => {
    let input = `.foo {
        color: blue;
    }
    .bar {
        color: blue;
    }`;
    let output = `:root {
        --color-1: blue;\n}
    .foo {
        color: var(--color-1);
    }
    .bar {
        color: var(--color-1);
    }`;
    return run(t, input, output, optDefault);
});

test('option "onlyColor"', t => {
    let input = `.foo {
        color: #000;
        border: 1px solid hsla(120,100%,50%, 0.5);
        width: 10px;
        display: block;
    }`;
    let output = `:root {
        --color-1: #000;
        --border-1: hsla(120,100%,50%, 0.5);\n}\n.foo {
        color: var(--color-1);
        border: 1px solid var(--border-1);
        width: 10px;
        display: block;
    }`;
    return run(t, input, output, { onlyColor: true });
});

test('exist root element', t => {
    let input = `:root {
        --base-font-size: 16px;
    }
    .foo {
        color: #000;
        font-size: var(--base-font-size);
    }`;
    let output = `:root {
        --base-font-size: 16px;
        --color-1: #000;
    }
    .foo {
        color: var(--color-1);
        font-size: var(--base-font-size);
    }`;
    return run(t, input, output, { });
});

