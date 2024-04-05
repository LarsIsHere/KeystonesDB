# KeystonesDB
KeystonesDB is a simple and lightweight JSON Database purposed for the B4D Project
```js
const KeystonesDB = require('keystonesdb');

// Creating the database -> path of db, format json
let DB = new KeystonesDB('./path.json', true);

```


## Functions

- `set(key, value, createIfMissing)` - Sets the value of a key. If createIfMissing is true it will create the keys if they are missing. This value is true by default. The key placeholder can hold a path to a key in the form of an array.
- `get(key)` - Returns the value of a key. This function also allows for paths in form of arrays
- `contains(key)` -
- `remove(key)` -
- 
- `backup(path, async)` -
  
- `addValue(key, number)` -
- `subtractValue(key, number)` -
- `renameKey(oldKey, newKey)` -
- `isOfType(key, dataType)` -
- `` - more soon
### Arrays
- `push(key, value, createIfMissing)` -
- `removeFromArray(key, value)` -
- `arrayLength(key)` -
- `getItemFromArray(key, index)` -
- `updateItemInArray(key, index, newValue)` -
- `clearArray(key)` -
### Filtering & Conditions
- `matchesCondition(key, conditionFunction)` -
- `filterArray(key, conditionFunction)` - 


## Changelog
