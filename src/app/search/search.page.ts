import { Component, OnInit } from '@angular/core';
import { SqliteService } from '../services/sqlite.service';
import { UtilService } from '../services/util.service';
import { Exercise } from '../interfaces/exercise'
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  
  public exercises: Exercise[];
  public filteredExercises: Exercise[] = [];
  public searchTerm: string = '';
  public selectedType: string = 'Todos';

  constructor(private sqlite: SqliteService, public util: UtilService, private router: Router) { }

  async ngOnInit() {  
    await this.loadExercises();
  }

  async loadExercises() {
    try {
      const ejerciciosPesos = await this.sqlite.readExercisesType1()
      const ejerciciosDistancias = await this.sqlite.readExercisesType2()
      const ejerciciosBodyBuilding = await this.sqlite.readExercisesType3()
      const ejerciciosDesafios = await this.sqlite.readExercisesType4()

      const types = await this.sqlite.readTypes('1 = 1')

      this.exercises = ejerciciosPesos.concat(ejerciciosDistancias, ejerciciosBodyBuilding, ejerciciosDesafios);
      this.sortExercisesAlphabetically();
      this.filterExercises();
  
    } catch (error) {
      console.error('Error obteniendo los datos de Firestore:', error);
    }
  }

  sortExercisesAlphabetically() {
    this.exercises.sort((a, b) => a.name.localeCompare(b.name));
  }

  filterExercises() {
    const term = this.searchTerm.toLowerCase();
    let filtered = this.exercises.filter(ex =>
      ex.name.toLowerCase().includes(term) ||
      ex.description.toLowerCase().includes(term)
    );

    if (this.selectedType !== 'Todos') {
      const typeId = this.getTypeId(this.selectedType);
      filtered = filtered.filter(ex => ex.id_type === typeId);
    }

    this.filteredExercises = filtered;
  }

  applyTextFilter(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterExercises();
  }

  applyTypeFilter(event: any) {
    this.selectedType = event.detail.value;
    this.filterExercises();
  }

  getTypeName(tipo: number): string {
    switch (tipo) {
      case 1:
        return 'Pesos';
      case 2:
        return 'Distancias';
      case 3:
        return 'Body Building';
      case 4:
        return 'Desafíos';
      case 5:
        return 'A Heroe';
      case 6:
        return 'A Girl';
      default:
        return 'Desconocido';
    }
  }

  getTypeId(typeName: string): number {
    switch (typeName) {
      case 'Pesos':
        return 1;
      case 'Distancias':
        return 2;
      case 'Bodybuilding':
        return 3;
      case 'Desafíos':
        return 4;
      case 'A Heroe':
        return 5;
      case 'A Girl':
        return 6;
      default:
        return 0; // 0 puede representar "Todos" o un valor no válido
    }
  }

  openAddResult(ejercicio: Exercise) {
    this.router.navigate(['add-result'], { state: { ejercicio } });
  }
}