import { PassThrough } from 'node:stream';

import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { ServerRouter, type EntryContext } from 'react-router';

const ABORT_DELAY = 5_000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    reactRouterContext: EntryContext
) {
    return isbot(request.headers.get('user-agent'))
        ? handleBotRequest(
              request,
              responseStatusCode,
              responseHeaders,
              reactRouterContext
          )
        : handleBrowserRequest(
              request,
              responseStatusCode,
              responseHeaders,
              reactRouterContext
          );
}

function handleBotRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    reactRouterContext: EntryContext
) {
    return new Promise((resolve, reject) => {
        const { abort, pipe } = renderToPipeableStream(
            <ServerRouter context={reactRouterContext} url={request.url} />,
            {
                onAllReady() {
                    const body = new PassThrough();

                    responseHeaders.set('Content-Type', 'text/html');

                    resolve(
                        new Response(createReadableStreamFromReadable(body), {
                            headers: responseHeaders,
                            status: responseStatusCode
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    console.error(error);
                }
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
}

function handleBrowserRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    reactRouterContext: EntryContext
) {
    return new Promise((resolve, reject) => {
        const { abort, pipe } = renderToPipeableStream(
            <ServerRouter context={reactRouterContext} url={request.url} />,
            {
                onShellReady() {
                    const body = new PassThrough();

                    responseHeaders.set('Content-Type', 'text/html');

                    resolve(
                        new Response(createReadableStreamFromReadable(body), {
                            headers: responseHeaders,
                            status: responseStatusCode
                        })
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    console.error(error);
                    responseStatusCode = 500;
                }
            }
        );

        setTimeout(abort, ABORT_DELAY);
    });
}
