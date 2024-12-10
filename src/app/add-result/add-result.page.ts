import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Exercise } from '../interfaces/exercise';
import { Result } from '../interfaces/result';
import { SqliteService } from '../services/sqlite.service';
import { UtilService } from '../services/util.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-add-result',
  templateUrl: './add-result.page.html',
  styleUrls: ['./add-result.page.scss'],
})
export class AddResultPage implements OnInit {

  public ejercicio: Exercise | null = null;
  public resultForm: FormGroup;

  public weightUnits: string[] = ['kgs', 'lbs'];
  public finishOptions: string[] = ['Yes', 'No'];

  constructor(
    private router: Router, 
    public util: UtilService, 
    private sqlite: SqliteService,
    private fb: FormBuilder,
    private toastController: ToastController ) {
      this.resultForm = this.fb.group({});
     }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.ejercicio = navigation.extras.state['ejercicio'];
      console.log('Ejercicio recibido:', this.ejercicio);
    } else {
      console.warn('No se recibió ningún ejercicio.');
      this.router.navigate(['search']);
    }
  }

  initializeForm() {
    if (!this.ejercicio) {
      return;
    }

    // Configura los controles comunes
    this.resultForm = this.fb.group({
      reps: ['', [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
      comments: ['', Validators.maxLength(500)]
    });

    // Agrega controles específicos según id_measure
    switch (this.ejercicio.id_measure) {
      case 1:
        // id_measure 1: Número decimal y selector de unidades
        this.resultForm.addControl('resultValue', this.fb.control('', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]));
        this.resultForm.addControl('resultUnit', this.fb.control('kgs', Validators.required));
        break;
      case 2:
        // id_measure 2: Formato hh:MM:ss
        this.resultForm.addControl('resultTime', this.fb.control('', [Validators.required, Validators.pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)]));
        break;
      case 3:
        // id_measure 3: Formato MM:ss:SSS
        this.resultForm.addControl('resultTimeMs', this.fb.control('', [Validators.required, Validators.pattern(/^([0-5]\d):([0-5]\d):(\d{3})$/)]));
        break;
      case 4:
        // id_measure 4: Selector Yes/No
        this.resultForm.addControl('resultFinish', this.fb.control('Yes', Validators.required));
        break;
      case 5:
        // id_measure 5: Rounds con solo números enteros
        this.resultForm.addControl('resultRounds', this.fb.control('', [Validators.required, Validators.pattern(/^\d+$/)]));
        break;
      default:
        console.warn('id_measure no reconocido:', this.ejercicio.id_measure);
        break;
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  submitResult() {
    if (this.resultForm.valid && this.ejercicio) {
      const formValues = this.resultForm.value;

      let resultField: string = '';
      switch (this.ejercicio.id_measure) {
        case 1:
          // Número decimal + unidad
          resultField = `${formValues.resultValue} ${formValues.resultUnit}`;
          break;
        case 2:
          // Formato hh:MM:ss
          resultField = formValues.resultTime; // Ya está en formato correcto
          break;
        case 3:
          // Formato MM:ss:SSS
          resultField = formValues.resultTimeMs; // Ya está en formato correcto
          break;
        case 4:
          // Finish: Yes/No
          resultField = formValues.resultFinish;
          break;
        case 5:
          // Rounds: número entero
          resultField = formValues.resultRounds.toString();
          break;
        default:
          resultField = '';
          break;
      }

      const result: Result = {
        id: 0, // Asume que la base de datos asigna este valor
        id_exercise: this.ejercicio.id,
        result: resultField,
        reps: formValues.reps,
        date: formValues.date, // Se puede almacenar como string en formato ISO
        comments: formValues.comments
      };

      // Guarda el resultado en la base de datos
      this.sqlite.createResult(result)
        .then(() => {
          console.log('Resultado guardado exitosamente:', result);
          this.presentToast('Resultado guardado correctamente.', 'success');
          this.resultForm.reset({
            result: '',
            reps: '',
            date: '',
            comments: ''
          });
          // Redirigir al usuario a la página de búsqueda
          this.router.navigate(['search']);
        })
        .catch(err => {
          console.error('Error al guardar el resultado:', err);
          this.presentToast('Error al guardar el resultado.', 'danger');
        });
    } else {
      console.warn('Formulario inválido o ejercicio no seleccionado.');
      this.presentToast('Por favor, completa los campos obligatorios.', 'danger');
    }
  }

}
