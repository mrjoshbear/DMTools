import { toTitleCase } from './textUtils'

describe('tests for textUtils.ts', () => {

  it('renders a phrase in Title Case', () => {
    // arrange
    const word = 'one two';
    // act
    const actual = toTitleCase(word);
    // assert
    expect(actual).toEqual('One Two');
  });

});
