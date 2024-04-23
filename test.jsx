import React from 'react';
import { renderToPipeableStream } from 'react-dom/server.node';
import { renderToReadableStream } from 'react-dom/server.edge';
import { Writable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import { TextDecoder } from 'node:util';

function App() {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>App</title>
            </head>
            <body>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean dictum nulla ut magna pretium rhoncus. Maecenas ligula quam, vestibulum eget risus eu, malesuada dignissim lacus. Mauris orci tellus, porttitor eu consectetur ac, faucibus a urna. In fermentum pretium iaculis. Sed interdum purus arcu, eu rhoncus lacus tempor sit amet. In hac habitasse platea dictumst. Donec sollicitudin interdum elit id pretium. Phasellus semper nunc id nisi tincidunt, non vestibulum neque convallis. Vestibulum pellentesque est ut est pretium rutrum. Phasellus eget tristique magna, vitae vestibulum leo. Quisque luctus, mauris eleifend pretium porttitor, nulla ex gravida odio, sed hendrerit ante ex nec elit. Integer in neque sed nulla suscipit pellentesque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla maximus quam tempor, tempus sapien sed, suscipit arcu. Mauris vel auctor ipsum. Sed viverra neque ante, sed sollicitudin libero posuere non. Praesent justo ante, commodo a felis nec, feugiat tincidunt odio. Integer auctor porttitor ipsum, sed ultrices ipsum tristique at. Cras malesuada eu est non blandit. Pellentesque at laoreet est. Vivamus placerat erat vitae orci sodales, et pretium tellus interdum. Praesent ipsum nisi, sodales a velit vehicula, facilisis efficitur lorem. Phasellus id velit eget ligula molestie convallis eget vel urna. Praesent ultrices tortor nisl, ut iaculis massa convallis non. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed erat nibh, venenatis eu semper ut, maximus ut massa. Aliquam mattis eleifend libero a posuere. Duis molestie fringilla augue, et rutrum erat convallis nec. Nam a molestie mauris. Proin sagittis vitae ante sed fermentum. Praesent nec vehicula diam. Maecenas leo eros, consequat sit amet gravida vel, molestie nec dolor. Praesent eleifend sed tortor at commodo. Vivamus sed arcu vel massa sollicitudin lobortis non at nunc. Donec in mi non eros pellentesque vehicula. Quisque commodo enim laoreet nisl fringilla rhoncus. Nam sed elit enim. Quisque non diam erat. In egestas ex sit amet ex tincidunt, ac maximus ligula sodales. Aenean egestas malesuada risus eu porttitor. Vivamus vehicula nunc non felis finibus, ac auctor arcu molestie. Ut placerat sit amet ligula in rhoncus. Pellentesque at vulputate nulla, eu sollicitudin lorem. Maecenas et odio a enim mollis semper nec eget sapien. Mauris ac malesuada diam. Sed metus mi, rutrum non lorem sit amet, dapibus euismod leo. Nullam blandit, velit vel feugiat convallis, mauris massa sodales diam, a suscipit tellus dui vel tortor. Phasellus eget consequat nisi. Proin sollicitudin dui mi, accumsan viverra felis faucibus et. Ut non arcu hendrerit sapien sollicitudin sollicitudin id eget dolor. Sed suscipit semper nulla vitae elementum. Fusce ut lacus venenatis, posuere erat a, aliquet ligula. Sed molestie eleifend feugiat. Etiam in lacus vel purus dignissim porttitor. Proin mauris leo, blandit volutpat posuere sed, dictum vel leo. Cras at odio a quam consectetur egestas. Suspendisse id dolor sit amet massa semper interdum. Quisque sit amet felis vel sem tincidunt vulputate eget quis augue. Donec quis lectus ex. Integer efficitur, tellus ut placerat condimentum, ex mauris dictum quam, at feugiat neque nisl vitae libero. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed vehicula ex magna, ut finibus ipsum euismod sollicitudin.</p>
            </body>
        </html>
    )
}

function renderToStringNode (element) {
    return new Promise((resolve, reject) => {
        const { pipe } = renderToPipeableStream(element, {
            onAllReady() {
                let data = '';
                let decoder = new StringDecoder();
                pipe(new Writable({
                    write(chunk, _, cb) {
                        data += decoder.write(chunk);
                        cb();
                    },
                    final(cb) {
                        data += decoder.end();
                        resolve(data);
                        cb();
                    }
                })) 
            },
            onShellError(error) {
                reject(error);
            }
        })
    })
}

async function renderToStringWeb (element) {
    const stream = await renderToReadableStream(element);
    await stream.allReady;
    let data = '';
    let decoder = new TextDecoder('utf-8', { fatal: true });
    for await (const chunk of stream) {
        data += decoder.decode(chunk, { stream: true });
    }
    data += decoder.decode();
    return data; 
}

// warmup
for (let i = 0; i < 10; i++) {
    await renderToStringNode(<App />);
    await renderToStringWeb(<App />);
}

console.time('node');
const r1 = await renderToStringNode(<App />);
console.timeEnd('node');

console.time('web');
const r2 = await renderToStringWeb(<App />);
console.timeEnd('web');

console.assert(r1 === r2);