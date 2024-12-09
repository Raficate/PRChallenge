import { Component } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
import { Exercise } from '../interfaces/exercise'
import { Result } from '../interfaces/result'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public result: string;
  public results: string[];
  public exercises: Exercise[];

  constructor(
    private sqlite: SqliteService
  ) {
    this.result = '';
    this.results = [];
  }

  // Al entrar, leemos la base de datos
  ionViewWillEnter(){
    this.readExercises();
  }

  create(){
    // Creamos un elemento en la base de datos
    this.sqlite.create(this.result.toUpperCase()).then( (changes) =>{
      console.log(changes);
      console.log("Creado");
      this.result = '';
      this.readResults(); // Volvemos a leer
    }).catch(err => {
      console.error(err);
      console.error("Error al crear");
    })
  }

  readResults(){
    // Leemos los datos de la base de datos
    this.sqlite.readResults().then( (results: string[]) => {
      this.results = results;
      console.log("Leido");
      console.log(this.results);
    }).catch(err => {
      console.error(err);
      console.error("Error al leer");
    })
  }

  readExercises(){
    // Leemos los datos de la base de datos
    this.sqlite.readAllExercises().then( (exercises: Exercise[]) => {
      this.exercises = exercises;
      console.log("Leido");
      console.log(this.exercises);
    }).catch(err => {
      console.error(err);
      console.error("Error al leer");
    })
  }
  
  update(result: string){
    // Actualizamos el elemento (result) por el nuevo elemento (this.result)
    this.sqlite.update(this.result.toUpperCase(), result).then( (changes) => {
      console.log(changes);
      console.log("Actualizado");
      this.result = '';
      this.readResults(); // Volvemos a leer
    }).catch(err => {
      console.error(err);
      console.error("Error al actualizar");
    })
  }

  delete(result: string){
    // Borramos el elemento
    this.sqlite.delete(result).then( (changes) => {
      console.log(changes);
      console.log("Borrado");
      this.readResults(); // Volvemos a leer
    }).catch(err => {
      console.error(err);
      console.error("Error al borrar");
    })
  }

}
