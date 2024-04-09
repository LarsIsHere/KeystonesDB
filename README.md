# KeystonesDB
KeystonesDB is a simple and lightweight JSON Database
```npm
npm install keystonesdb
```
```js
const KeystonesDB = require('keystonesdb');

// Creating the database -> path of db, format json, other options
let DB = new KeystonesDB('./path.json', true, {
  caching: 'none'
});

```
Use an array of keys (e.g., `['parentKey', 'childKey', ...]`) to specify nested keys within the database. This allows you to access values at deeper levels of the data structure.

## Functions
### Basics
- `set(key, value, createIfMissing)` - Sets the value of a key. If createIfMissing is true it will create the keys if they are missing. This value is true by default. The key placeholder can hold a path to a key in the form of an array (e.g ['key1', 'key2',...]).
- `get(key)` - Returns the value of a key
- `contains(key)` - If a key exists in a database
- `remove(key)` - Removes a key
- `all()` - Returns the entire database
### Database
- `backup(path, async)` - Creates a backup of the database at the provided path. If Async is set to true it will create the backup in a new worker thread (Useful for bigger databases)
- `restore(path)` - Restores the database from the provided backup json file path
- `import(path)` - Imports the json from the provided file path into the database. (Works the same as the restore() funtion)
### Other
- `addValue(key, number)` - Adds a number to a key
- `subtractValue(key, number)` - Subtracts a number from a key
- `renameKey(oldKey, newKey)` - Renames a key
- `isOfType(key, dataType)` - Checks if the value of a key is the provided data type (e.g boolean, string, array, object,...)
- `` - more soon
### Arrays
- `push(key, value, createIfMissing)` - Pushes an item into an array. if createIfMissing is set to true, the array will be created in case it doesn't exist.
- `removeFromArray(key, value)` - Removes all the occurences of the provided value
- `arrayLength(key)` - Checks the array length
- `getItemFromArray(key, index)` - Returns the the item of an array based on its index
- `updateItemInArray(key, index, newValue)` - Updates the the item of an array based on its index
- `clearArray(key)` - Clears all the items in an array
### Filtering & Conditions
- `matchesCondition(key, conditionFunction)` - Checks if the value of the key meets the condition you provided (Scroll down to learn more)
- `filterArray(key, conditionFunction)` - Filters an array based on the provided condition (Scroll down to learn more)
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

### Conditions
Using the MatchesCondition method we can check if a certain key matches our provided condition. You can use about almost any conditioning you can think about including regex
A couple of examples:
Check if a user is older than 18
```js
const isOver18 = value => value >= 18;
console.log(DB.matchesCondition(['user', 'age'], isOver18)); // Output: true
```
Check if an email is valid using regex
```js
const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
console.log(DB.matchesCondition('email', isValidEmail));
```
Their age is between 25 and 40.
They have a job title containing the word "Engineer".
They are active employees (i.e., their isActive status is true).
```js
const isDesiredEmployee = employee => {
    return employee.age >= 25 && employee.age <= 40 &&
           employee.jobTitle.includes('Engineer') &&
           employee.isActive === true;
};
console.log(DB.matchesCondition(['employees', '123'], isDesiredEmployee));
```
### Caching
(This is a new feature and is subject to bugs and problems. Importing and Restoring might not work as expected)

Since of v1.1.0 You can use a very basic version of caching in your database allowing for faster loading times. Caching works completely automatically and you don't have to setup anything besides setting the `caching` value to your preferred method.
| Caching Method  | Description                                                                                                                                                                                                                                                                   |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `write-through` | This method first writes data to a cache and then to the database. It's efficient for smaller databases, enhancing data retrieval speed. However, as the database grows, updating the cache with every write can slow down the database due to increased management overhead. |

## Changelog

v1.1.0 - Added basic "Write-Through" Caching