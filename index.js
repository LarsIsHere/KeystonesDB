const fs = require('fs');
const { Worker } = require('worker_threads');

class KeystonesDB {
    constructor(filePath, beautify, options = {}) {
        this.filePath = filePath;
        this.beautify = beautify;
        this.caching = options.caching || "none";
        this.cache = '{}';
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '{}');
        }
      if (this.caching !== 'none') {
          try {
              const fileData = fs.readFileSync(filePath, 'utf8');
              this.cache = fileData;
          } catch (error) {
              console.error('Error reading file:', error);
          }
      }
      this.listeners = {
          beforeSet: [],
          afterSet: [],
          beforeRemove: [],
          afterRemove: []
      };
    };
 


  // Caching functions
  CachingParseFile() {
    switch (this.caching) {
      case 'none':
      return JSON.parse(fs.readFileSync(this.filePath));
        
      case 'write-through':
        return JSON.parse(this.cache);
        

      default:
        throw new Error('"' + this.caching + '" is an invalid caching option. Usable options are "none" and "write-through".');
    }
  }

  CachingWriteFile(data) {
    switch(this.caching) {
      case 'none':
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(data, null, 2) : JSON.stringify(data));
        
        break;
      case 'write-through':
        this.cache = this.beautify ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(data, null, 2) : JSON.stringify(data));
        
        break;
        
      default:
        throw new Error('"' + this.caching + '" is an invalid caching option. Usable options are "none" and "write-through".');
        
    }
  }
  
  on(event, listener) {
      if (this.listeners[event]) {
          this.listeners[event].push(listener);
      }
  }

  // Function to trigger event listeners
  emit(event, data) {
      if (this.listeners[event]) {
          this.listeners[event].forEach(listener => {
              listener(data);
          });
      }
  }

  set(pathOrKey, value, createIfMissing = true) {
      //let data = JSON.parse(fs.readFileSync(this.filePath));
      let data = this.CachingParseFile();
      let current = data;
      this.emit('beforeSet', { pathOrKey, value });
      if (typeof pathOrKey === 'string') {
          current[pathOrKey] = value;
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length - 1; i++) {
              if (!current[pathOrKey[i]]) {
                  if (createIfMissing) {
                      current[pathOrKey[i]] = {};
                  } else {
                      return;
                  }
              }
              current = current[pathOrKey[i]];
          }
          current[pathOrKey[pathOrKey.length - 1]] = value;
      }

      // fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(data, null, 2) : JSON.stringify(data));
    this.CachingWriteFile(data);
    this.emit('afterSet', { pathOrKey, value });
  }

  get(pathOrKey) {
      let data = this.CachingParseFile();
      let current = data;
      if (typeof pathOrKey === 'string') {
          return current[pathOrKey];
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return undefined;
              }
              current = current[pathOrKey[i]];
          }
          return current;
      }

      return undefined;
  }

  backup(backupFilePath, async = false) {
      if (async) {
          const worker = new Worker(`
              const fs = require('fs');
              const path = require('path');
              const { parentPort, workerData } = require('worker_threads');

              const backupFilePath = workerData.backupFilePath;
              const filePath = workerData.filePath;

              fs.copyFileSync(filePath, backupFilePath);
              parentPort.postMessage('Backup completed');
          `, { eval: true, workerData: { backupFilePath, filePath: this.filePath } });

          worker.on('message', (msg) => {
              console.log(msg);
          });

          worker.on('error', (err) => {
              console.error(`Error during backup: ${err.message}`);
          });

          worker.on('exit', (code) => {
              if (code !== 0) {
                  console.error(`Worker stopped with exit code ${code}`);
              }
          });
      } else {
          let data = fs.readFileSync(this.filePath);
          fs.writeFileSync(backupFilePath, data);
      }
  }

  contains(pathOrKey) {
    let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          return current.hasOwnProperty(pathOrKey);
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return false;
              }
              current = current[pathOrKey[i]];
          }
          return true;
      }

      return false;
  }
  remove(pathOrKey) {
      let data = this.CachingParseFile();
    
      let current = data;
      this.emit('beforeRemove', { pathOrKey });
      if (typeof pathOrKey === 'string') {
          delete current[pathOrKey];
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length - 1; i++) {
              if (!current[pathOrKey[i]]) {
                  return;
              }
              current = current[pathOrKey[i]];
          }
          delete current[pathOrKey[pathOrKey.length - 1]];
      }

      
    this.CachingWriteFile(data);
    this.emit('afterRemove', { pathOrKey });
  }

  push(pathOrKey, value, createIfMissing = true) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (!current[pathOrKey]) {
              if (createIfMissing) {
                  current[pathOrKey] = [];
              } else {
                  return;
              }
          }
          current[pathOrKey].push(value);
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length - 1; i++) {
              if (!current[pathOrKey[i]]) {
                  if (createIfMissing) {
                      current[pathOrKey[i]] = {};
                  } else {
                      return;
                  }
              }
              current = current[pathOrKey[i]];
          }
          if (!current[pathOrKey[pathOrKey.length - 1]]) {
              if (createIfMissing) {
                  current[pathOrKey[pathOrKey.length - 1]] = [];
              } else {
                  return;
              }
          }
          current[pathOrKey[pathOrKey.length - 1]].push(value);
      }

      this.CachingWriteFile(data);
  }


  removeFromArray(pathOrKey, value) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (!current[pathOrKey] || !Array.isArray(current[pathOrKey])) {
              return;
          }
          current[pathOrKey] = current[pathOrKey].filter(item => item !== value);
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length - 1; i++) {
              if (!current[pathOrKey[i]]) {
                  return;
              }
              current = current[pathOrKey[i]];
          }
          if (!current[pathOrKey[pathOrKey.length - 1]] || !Array.isArray(current[pathOrKey[pathOrKey.length - 1]])) {
              return;
          }
          current[pathOrKey[pathOrKey.length - 1]] = current[pathOrKey[pathOrKey.length - 1]].filter(item => item !== value);
      }

      this.CachingWriteFile(data);
  }


  arrayLength(pathOrKey) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (!current[pathOrKey] || !Array.isArray(current[pathOrKey])) {
              return 0;
          }
          return current[pathOrKey].length;
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return 0;
              }
              current = current[pathOrKey[i]];
          }
          if (!Array.isArray(current)) {
              return 0;
          }
          return current.length;
      }

      return 0;
  }

  getItemFromArray(pathOrKey, index) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          return current[pathOrKey] && Array.isArray(current[pathOrKey]) ? current[pathOrKey][index] : undefined;
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return undefined;
              }
              current = current[pathOrKey[i]];
          }
          return Array.isArray(current) ? current[index] : undefined;
      }

      return undefined;
  }

  updateItemInArray(pathOrKey, index, newValue) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (current[pathOrKey] && Array.isArray(current[pathOrKey]) && current[pathOrKey][index] !== undefined) {
              current[pathOrKey][index] = newValue;
          }
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return;
              }
              current = current[pathOrKey[i]];
          }
          if (Array.isArray(current) && current[index] !== undefined) {
              current[index] = newValue;
          }
      }

      this.CachingWriteFile(data);
  }

  containsItemInArray(pathOrKey, value) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          return current[pathOrKey] && Array.isArray(current[pathOrKey]) ? current[pathOrKey].includes(value) : false;
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return false;
              }
              current = current[pathOrKey[i]];
          }
          return Array.isArray(current) ? current.includes(value) : false;
      }

      return false;
  }

  clearArray(pathOrKey) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (current[pathOrKey] && Array.isArray(current[pathOrKey])) {
              current[pathOrKey] = [];
          }
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return;
              }
              current = current[pathOrKey[i]];
          }
          if (Array.isArray(current)) {
              current = [];
          }
      }

      this.CachingWriteFile(data);
  }

  addValue(pathOrKey, number) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (typeof current[pathOrKey] === 'number') {
              current[pathOrKey] += number;
          }
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length - 1; i++) {
              if (!current[pathOrKey[i]]) {
                  return;
              }
              current = current[pathOrKey[i]];
          }
          if (typeof current[pathOrKey[pathOrKey.length - 1]] === 'number') {
              current[pathOrKey[pathOrKey.length - 1]] += number;
          }
      }

      this.CachingWriteFile(data);
  }

  subtractValue(pathOrKey, number) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (typeof current[pathOrKey] === 'number') {
              current[pathOrKey] -= number;
          }
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length - 1; i++) {
              if (!current[pathOrKey[i]]) {
                  return;
              }
              current = current[pathOrKey[i]];
          }
          if (typeof current[pathOrKey[pathOrKey.length - 1]] === 'number') {
              current[pathOrKey[pathOrKey.length - 1]] -= number;
          }
      }

      this.CachingWriteFile(data);
  }

  all() {
      let data = JSON.parse(fs.readFileSync(this.filePath));
      return data;
  }


  renameKey(oldKey, newKey) {
      let data = this.CachingParseFile();
      if (data.hasOwnProperty(oldKey)) {
          data[newKey] = data[oldKey];
          delete data[oldKey];
          this.CachingWriteFile(data);
          return true;
      }
      return false;
  }

  matchesCondition(pathOrKey, conditionFunction) {
    let data = this.CachingParseFile();
      let value = this.get(pathOrKey);
      if (value !== undefined) {
          return conditionFunction(value);
      }
      return false;
  }

  filterArray(pathOrKey, conditionFunction) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          if (!current[pathOrKey] || !Array.isArray(current[pathOrKey])) {
              return [];
          }
          current[pathOrKey] = current[pathOrKey].filter(conditionFunction);
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length - 1; i++) {
              if (!current[pathOrKey[i]]) {
                  return [];
              }
              current = current[pathOrKey[i]];
          }
          if (!current[pathOrKey[pathOrKey.length - 1]] || !Array.isArray(current[pathOrKey[pathOrKey.length - 1]])) {
              return [];
          }
          current[pathOrKey[pathOrKey.length - 1]] = current[pathOrKey[pathOrKey.length - 1]].filter(conditionFunction);
      }

      this.CachingWriteFile(data);
      return current[pathOrKey];
  }

  isOfType(pathOrKey, dataType) {
      let data = this.CachingParseFile();
      let current = data;

      if (typeof pathOrKey === 'string') {
          return typeof current[pathOrKey] === dataType;
      } else if (Array.isArray(pathOrKey)) {
          for (let i = 0; i < pathOrKey.length; i++) {
              if (!current[pathOrKey[i]]) {
                  return false;
              }
              current = current[pathOrKey[i]];
          }
          return typeof current === dataType;
      }

      return false;
  }

  restore(backupFilePath) {
      try {

          const backupData = fs.readFileSync(backupFilePath, 'utf-8');
          const parsedBackupData = JSON.parse(backupData);

          // fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(parsedBackupData, null, 2) : JSON.stringify(parsedBackupData));
        this.CachingWriteFile(parsedBackupData);
          console.log('Database restored successfully from backup.');
      } catch (error) {
          console.error('Error restoring database from backup:', error.message);
      }
  }


  import(importFilePath) {
      try {
          const importData = fs.readFileSync(importFilePath, 'utf-8');const parsedImportData = JSON.parse(importData);

          //fs.writeFileSync(this.filePath, this.beautify ? JSON.stringify(parsedImportData, null, 2) : JSON.stringify(parsedImportData));
        
          this.CachingWriteFile(parsedImportData);

          console.log('Data imported successfully.');
      } catch (error) {
          console.error('Error importing data:', error.message);
      }
  }
}

module.exports = KeystonesDB;

