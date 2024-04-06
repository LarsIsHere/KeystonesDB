# KeystonesDB
KeystonesDB is a simple and lightweight JSON Database
```js
const KeystonesDB = require('keystonesdb');

// Creating the database -> path of db, format json
let DB = new KeystonesDB('./path.json', true);

```


## Functions
### Basics
- `set(key, value, createIfMissing)` - Sets the value of a key. If createIfMissing is true it will create the keys if they are missing. This value is true by default. The key placeholder can hold a path to a key in the form of an array (e.g ['key1', 'key2',...]).
- `get(key)` - Returns the value of a key. This function also allows for paths in form of arrays
- `contains(key)` - If a key exists in a database. Accepts a path input
- `remove(key)` - Removes a key. Accepts a path input
- `all()` - Returns the entire database
### Database
- `backup(path, async)` - Creates a backup of the database at the provided path. If Async is set to true it will create the backup in a new worker thread (Useful for bigger databases)
- `restore(path)` - Restores the database from the provided backup json file path
- `import(path)` - Imports the json from the provided file path into the database. (Works the same as the restore() funtion)
### Other
- `addValue(key, number)` - Adds a number to a key. Accepts a path input
- `subtractValue(key, number)` - Subtracts a number from a key. Accepts a path input
- `renameKey(oldKey, newKey)` - Renames a key. Accepts a path input
- `isOfType(key, dataType)` - Checks if the value of a key is the provided data type (e.g boolean, string, array, object,...) Accepts a path input
- `` - more soon
### Arrays
- `push(key, value, createIfMissing)` - Pushes an item into an array. if createIfMissing is set to true, the array will be created in case it doesn't exist.
- `removeFromArray(key, value)` - Removes all the occurences of the provided value. Accepts a path input
- `arrayLength(key)` - Checks the array length. Accepts a path input
- `getItemFromArray(key, index)` - Returns the the item of an array based on its index. Accepts a path input
- `updateItemInArray(key, index, newValue)` - Updates the the item of an array based on its index. Accepts a path input
- `clearArray(key)` - Clears all the items in an array. Accepts a path input
### Filtering & Conditions
- `matchesCondition(key, conditionFunction)` - Checks if the value of the key meets the condition you provided (Scroll down to learn more). Accepts a path input
- `filterArray(key, conditionFunction)` - Filters an array based on the provided condition (Scroll down to learn more). Accepts a path input
### Events (w.i.p)
- `beforeSet` - Event before a value is set
```js
DB.on('beforeSet', ({ pathOrKey, value }) => {
  console.log(`Before setting value at ${pathOrKey}:`, value);
});
```
- `afterSet` - Event after a value is set
```js
DB.on('afterSet', ({ pathOrKey, value }) => {
  console.log(`After setting value at ${pathOrKey}:`, value);
});
```
- `beforeRemove` - Before a key is removed
```js
DB.on('beforeRemove', ({ pathOrKey }) => {
  console.log(`Before removing key at ${pathOrKey}`);
});
```
- `afterRemove` - After a key is removed
```js
DB.on('afterRemove', ({ pathOrKey }) => {
  console.log(`After removing key at ${pathOrKey}`);
});
```


## Changelog
