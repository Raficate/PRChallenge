import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, capSQLiteChanges, capSQLiteValues } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite } from 'jeep-sqlite/dist/types/interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';

import { Exercise } from '../interfaces/exercise'
import { Type } from '../interfaces/type'
import { Result } from '../interfaces/result'

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  // Atributos

  // Observable para comprobar si la base de datos esta lista
  public dbReady: BehaviorSubject<boolean>;
  // Indica si estamos en web
  public isWeb: boolean;
  // Indica si estamos en IOS
  public isIOS: boolean;
  // Nombre de la base de datos
  public dbName: string;

  constructor(
    private http: HttpClient
  ) {
    this.dbReady = new BehaviorSubject(false);
    this.isWeb = false;
    this.isIOS = false;
    this.dbName = '';
  }

  async init() {

    const info = await Device.getInfo();
    // CapacitorSQLite no tiene disponible el metodo requestPermissions pero si existe y es llamable
    const sqlite = CapacitorSQLite as any;

    // Si estamos en android, pedimos permiso
    if (info.platform == 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error("Esta app necesita permisos para funcionar")
      }
      // Si estamos en web, iniciamos la web store
    } else if (info.platform == 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();
    } else if (info.platform == 'ios') {
      this.isIOS = true;
    }

    // Arrancamos la base de datos
    this.setupDatabase();

  }

  async setupDatabase() {

    // Obtenemos si ya hemos creado la base de datos
    const dbSetup = await Preferences.get({ key: 'first_setup_key' })

    // Sino la hemos creado, descargamos y creamos la base de datos
    if (!dbSetup.value) {
      this.downloadDatabase();
    } else {
      // Nos volvemos a conectar
      this.dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName })
      this.dbReady.next(true);
    }


  }

  downloadDatabase() {

    // Obtenemos el fichero assets/db/db.json
    this.http.get('assets/db/db.json').subscribe(async (jsonExport: JsonSQLite) => {


      const jsonstring = JSON.stringify(jsonExport);
      // Validamos el objeto
      const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

      // Si es valido
      if (isValid.result) {

        // Obtengo el nombre de la base de datos
        this.dbName = jsonExport.database;
        // Lo importo a la base de datos
        await CapacitorSQLite.importFromJson({ jsonstring });
        // Creo y abro una conexion a sqlite
        await CapacitorSQLite.createConnection({ database: this.dbName });
        await CapacitorSQLite.open({ database: this.dbName })

        // Marco que ya hemos descargado la base de datos
        await Preferences.set({ key: 'first_setup_key', value: '1' })
        // Guardo el nombre de la base de datos
        await Preferences.set({ key: 'dbname', value: this.dbName })

        // Indico que la base de datos esta lista
        this.dbReady.next(true);

      }

    })

  }

  async getDbName() {

    if (!this.dbName) {
      const dbname = await Preferences.get({ key: 'dbname' })
      if (dbname.value) {
        this.dbName = dbname.value
      }
    }
    return this.dbName;
  }

  async createResult(result: Result) {
    let sql = 'INSERT INTO results (id_exercise, result, reps, date, comments) VALUES (?, ?, ?, ?, ?)';
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            result.id_exercise,
            result.result,
            result.reps,
            result.date,
            result.comments
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async readAllResults() {
    // Sentencia para leer todos los registros
    let sql = 'SELECT * FROM results';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [] // necesario para android
    }).then((response: capSQLiteValues) => {
      let results: Result[] = [];

      // Si es IOS y hay datos, elimino la primera fila
      // Esto se debe a que la primera fila es informacion de las tablas
      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      // recorremos los datos
      for (let index = 0; index < response.values.length; index++) {
        const result = response.values[index];
        results.push(result);
      }
      return results;

    }).catch(err => Promise.reject(err))
  }

  async readAllExercises() {
    // Sentencia para leer todos los registros
    let sql = 'SELECT * FROM exercises';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [] // necesario para android
    }).then((response: capSQLiteValues) => {
      let exercises: Exercise[] = [];

      // Si es IOS y hay datos, elimino la primera fila
      // Esto se debe a que la primera fila es informacion de las tablas
      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      for (let index = 0; index < response.values.length; index++) {
        const exercise = response.values[index];
        exercises.push(exercise);
      }
      return exercises;

    }).catch(err => Promise.reject(err))
  }

  async readExercisesType1() {
    let sql = 'SELECT * FROM exercises WHERE id_type = 1';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: []
    }).then((response: capSQLiteValues) => {
      let exercises: Exercise[] = [];

      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      for (let index = 0; index < response.values.length; index++) {
        const exercise = response.values[index];
        console.log(exercise)
        exercises.push(exercise);
      }
      console.log(exercises)
      return exercises;

    }).catch(err => Promise.reject(err))
  }

  async readExercisesType2() {
    let sql = 'SELECT * FROM exercises WHERE id_type = 2';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [] 
    }).then((response: capSQLiteValues) => {
      let exercises: Exercise[] = [];

      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      for (let index = 0; index < response.values.length; index++) {
        const exercise = response.values[index];
        exercises.push(exercise);
      }
      return exercises;

    }).catch(err => Promise.reject(err))
  }

  async readExercisesType3() {
    let sql = 'SELECT * FROM exercises WHERE id_type = 3';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: []
    }).then((response: capSQLiteValues) => {
      let exercises: Exercise[] = [];

      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      for (let index = 0; index < response.values.length; index++) {
        const exercise = response.values[index];
        exercises.push(exercise);
      }
      return exercises;

    }).catch(err => Promise.reject(err))
  }

  async readExercisesType4() {
    let sql = 'SELECT * FROM exercises WHERE id_type = 4';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [] 
    }).then((response: capSQLiteValues) => {
      let exercises: Exercise[] = [];

      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      for (let index = 0; index < response.values.length; index++) {
        const exercise = response.values[index];
        exercises.push(exercise);
      }
      return exercises;

    }).catch(err => Promise.reject(err))
  }


  async readExercise() {
    // Sentencia para leer todos los registros
    let sql = 'SELECT * FROM exercises WHERE Id'; 
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [] // necesario para android
    }).then((response: capSQLiteValues) => {
      let exercises: Exercise[] = [];

      // Si es IOS y hay datos, elimino la primera fila
      // Esto se debe a que la primera fila es informacion de las tablas
      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }

      // recorremos los datos
      for (let index = 0; index < response.values.length; index++) {
        const exercise = response.values[index];
        exercises.push(exercise);
      }
      return exercises;

    }).catch(err => Promise.reject(err))
  }


  async update(newresult: string, originalresult: string) {
    // Sentencia para actualizar un registro
    let sql = 'UPDATE results SET name=? WHERE name=?';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            newresult,
            originalresult
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      // Si es web, debemos guardar el cambio en la webstore manualmente
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async delete(result: string) {
    // Sentencia para eliminar un registro
    let sql = 'DELETE FROM results WHERE name=?';
    // Obtengo la base de datos
    const dbName = await this.getDbName();
    // Ejecutamos la sentencia
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [
        {
          statement: sql,
          values: [
            result
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      // Si es web, debemos guardar el cambio en la webstore manualmente
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async readTypes(where) {
    let sql = 'SELECT * FROM types WHERE '+ where; 
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [] 
    }).then((response: capSQLiteValues) => {
      let types: Type[] = [];
      if (this.isIOS && response.values.length > 0) {
        response.values.shift();
      }
      for (let index = 0; index < response.values.length; index++) {
        const type = response.values[index];
        types.push(type);
      }
      return types;

    }).catch(err => Promise.reject(err))
  }


}
