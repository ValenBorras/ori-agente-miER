export interface ScriptMessage {
  id: string;
  speaker: 'Jujo' | 'Rogelio';
  text: string;
  estimatedDuration?: number; // in seconds for Rogelio messages
}

export const PRESENTATION_SCRIPT: ScriptMessage[] = [
  {
    id: '1',
    speaker: 'Jujo',
    text: '¡Hola! Soy Jujo, el primer ciudadano digital de Entre Ríos. Estoy acá para acompañarte y que tus trámites con la provincia sean más simples, rápidos y sin filas.'
  },
  {
    id: '2',
    speaker: 'Jujo',
    text: 'Con tu Ciudadanía Digital vas a poder entrar a Mi Entre Ríos, el nuevo espacio donde todos tus trámites están en un solo lugar. Ya no vas a tener que esperar turnos ni horarios, todo lo podés hacer online, cuando vos quieras y desde donde estés.'
  },
  {
    id: '3',
    speaker: 'Jujo',
    text: 'Te espero en Mi Entre Ríos para acompañarte paso a paso, con paciencia y amabilidad. Como todo cambio, lleva un tiempo acostumbrarse, pero no te preocupes: voy a estar ahí para vos, las 24 horas, los 365 días del año, listo para ayudarte.'
  },
  {
    id: '4',
    speaker: 'Jujo',
    text: 'Hola Gobernador, es un gusto conocerlo. Soy Jujo, el primer ciudadano digital de Entre Ríos. Vine para ayudar a que cada entrerriano pueda hacer sus trámites más fácil, más rápido y sin filas.'
  },
  {
    id: '5',
    speaker: 'Rogelio',
    text: '¡Hola Jujo! Encantado. Me alegra que seas parte de este cambio que estamos llevando adelante en la provincia. ¿Querés contarle a la gente qué es lo que estamos anunciando hoy?',
    estimatedDuration: 6
  },
  {
    id: '6',
    speaker: 'Jujo',
    text: 'Por supuesto Rogelio! Hoy estamos lanzando Mi Entre Ríos, la nueva plataforma digital de la provincia. Con Mi Entre Ríos, los ciudadanos van a tener por primera vez un único lugar para hacer sus trámites, sin papeles, sin traslados y con atención disponible todo el día.'
  },
  {
    id: '7',
    speaker: 'Rogelio',
    text: 'Contame un poco más, Jujo… ¿qué van a poder hacer los entrerrianos en la plataforma "Mi Entre Ríos"?',
    estimatedDuration: 6
  },
  {
    id: '8',
    speaker: 'Jujo',
    text: 'Muchísimas cosas, Gobernador. Por ejemplo: Descargar y pagar los impuestos de ATER sin salir de la plataforma. Solicitar partidas y certificados del Registro Civil. Ver sus recibos de sueldo si son empleados provinciales. Acceder a documentación de su obra social y consultar beneficios de Sidecreer. Y esto es solo el comienzo: pronto sumaremos más trámites y servicios para todos los entrerrianos.'
  },
  {
    id: '9',
    speaker: 'Rogelio',
    text: 'Un verdadero cambio en la relación entre el Estado y la gente.',
    estimatedDuration: 6
  },
  {
    id: '10',
    speaker: 'Jujo',
    text: 'Así es, Gobernador. Queremos que cada ciudadano active su Ciudadanía Digital y se sume a Mi Entre Ríos. Yo voy a estar ahí, las 24 horas, los 365 días, para acompañarlos paso a paso, con paciencia y amabilidad, en esta transformación digital que nos acerca y nos simplifica la vida.'
  },
  {
    id: '11',
    speaker: 'Jujo',
    text: 'Entrá a www.mientrerios.gob.ar, registrate y convertite en ciudadano digital. Hacé tus trámites desde cualquier lugar y ayudanos a construir juntos una Entre Ríos más moderna y sin papeles.'
  },
  {
    id: '12',
    speaker: 'Rogelio',
    text: 'Con Mi Entre Ríos damos un gran paso hacia un Estado más simple, digital y moderno, pensado para cuidar el tiempo de cada entrerriano. Te esperamos en la plataforma para ser parte de esta transformación.',
    estimatedDuration: 6
  }
]; 