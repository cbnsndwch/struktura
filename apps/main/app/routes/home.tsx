import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
    return [
        { title: 'Struktura • No-Code Document Management Platform' },
        {
            name: 'description',
            content:
                'Struktura combines the ease-of-use of apps like Airtable with the schema flexibility of MongoDB.'
        }
    ];
};

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-6xl font-bold">
                    Welcome to <span className="text-blue-600">Struktura</span>
                </h1>

                <p className="mt-3 text-2xl">
                    No-code document management platform
                </p>

                <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
                    {/* <a
                        href="/docs"
                        className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
                    >
                        <h3 className="text-2xl font-bold">
                            Documentation &rarr;
                        </h3>
                        <p className="mt-4 text-xl">
                            Find comprehensive guides and API references.
                        </p>
                    </a> */}

                    <a
                        href="/graphql"
                        className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
                    >
                        <h3 className="text-2xl font-bold">
                            GraphQL Playground &rarr;
                        </h3>
                        <p className="mt-4 text-xl">
                            Explore the API interactively.
                        </p>
                    </a>
                </div>
            </main>
        </div>
    );
}
