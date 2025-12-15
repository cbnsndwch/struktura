import { ExampleWrapper } from './ExampleWrapper.js';
import CardExample from './CardExample.js';
import FormExample from './FormExample.js';

export default function ComponentExample() {
    return (
        <ExampleWrapper>
            <CardExample />
            <FormExample />
        </ExampleWrapper>
    );
}
