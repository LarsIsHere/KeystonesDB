# KeystonesDB
KeystonesDB is a simple and lightweight JSON Database purposed for the B4D Project
```js
const KeystonesDB = require('keystonesdb');

// Creating the database -> path of db, format json
let DB = new KeystonesDB('./path.json', true);

```


## Functions

- `set(key, value, createIfMissing)` - Sets the value of a key. If createIfMissing is true it will create the keys if they are missing. This value is true by default. The key placeholder can hold a path to a key in the form of an array. For example:
If you wanted to set change the value of key5 from "foo" to "foo bar"
```json
{
    "key1": {
        "key3": "value",
        "key4": {
            "key5":"foo"
        }
    },
    "key2":"value"
}
```
```js
set(['key1','key4','key5'], 'foo bar');
```

- `get(key)` - Returns the value of a key. This function also allows for paths in form of arrays.
- `backup(path, async)` -
- `contains(key)` -
- `remove(key)` -
- `push(key, value, createIfMissing)` -
- `removeFromArray(key, value)` -
- `arrayLength(key)` -
- `getItemFromArray(key, index)` -
- `updateItemInArray(key, index, newValue)` -
- `clearArray(key)` -
- `addValue(key, number)` -
- `subtractValue(key, number)` -
- `renameKey(oldKey, newKey)` -
- `isOfType(key, dataType)` -
- `keyExists(key)` - soon
- `` - soon
### Filtering & Conditions
- `matchesCondition(key, conditionFunction)` -
- `filterArray(key, conditionFunction)` - 