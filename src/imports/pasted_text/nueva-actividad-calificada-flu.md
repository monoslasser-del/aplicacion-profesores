Actúa como un diseñador UX/UI senior especializado en apps educativas móviles para docentes de primaria. Toma como base la pantalla actual ya diseñada en Figma de la app “Acompáñame”, específicamente la ventana de “Nueva actividad”, donde ya existen estos elementos:

- campo “Nombre de la actividad”
- selección de “Campo Formativo”
- selector de “Tipo de Registro” con:
  - Solo registro
  - Participación
  - Calificada
- selector de “Método de Captura” con:
  - NFC Continuo
  - Manual
- botón principal “Crear y Capturar”

NO quiero rehacer la pantalla desde cero. Quiero una mejora precisa sobre esta misma estructura visual, manteniendo el estilo ya existente y haciendo que el flujo sea funcional, claro y útil para docentes.

OBJETIVO PRINCIPAL
Corregir y mejorar el comportamiento de la opción “Calificada”, ya que actualmente no abre el proceso adecuado. Quiero que en esa opción se integre un flujo especial de evaluación, sin romper la pantalla actual.

MEJORA SOLICITADA

1. MANTENER LA PANTALLA ACTUAL
Conservar el diseño base ya existente:
- nombre de la actividad arriba
- selección de campo formativo
- tipo de registro
- método de captura
- botón “Crear y Capturar”

No cambiar radicalmente la disposición general, solo mejorar la interacción y agregar las secciones faltantes.

2. HACER SELECCIONABLE EL TIPO DE REGISTRO
Actualmente, al cambiar el tipo de registro, no se siente bien resuelto. Quiero que el selector de:
- Solo registro
- Participación
- Calificada

funcione correctamente y cambie la interfaz de forma dinámica.

3. COMPORTAMIENTO DINÁMICO SEGÚN TIPO DE REGISTRO

A. Si el usuario selecciona “Solo registro”
La pantalla debe seguir simple.
No mostrar opciones de escala.
Solo permitir crear la actividad con:
- nombre
- campo formativo
- tipo de registro
- método de captura

Al guardar, la actividad debe permitir después registrar estados como:
- Entregó
- No entregó

Si el método es NFC continuo, al finalizar el tiempo o cierre de la actividad, los alumnos que no pasaron su tarjeta deben marcarse automáticamente como “No entregó”.

B. Si el usuario selecciona “Participación”
Mostrar un comportamiento similar a solo registro, pero pensado para participación.
Al guardar, la actividad debe permitir registrar después estados como:
- Requiere apoyo
- En proceso
- En desarrollo

Puede ser por captura manual o por NFC continuo.
Si se usa NFC continuo, los alumnos que no pasen su tarjeta al cierre quedan como “No entregó” o “Sin registrar”, pero después el maestro puede asignar su estatus a quienes sí participaron.

C. Si el usuario selecciona “Calificada”
Aquí está el cambio más importante.

NO quiero que la pantalla principal se sature con todos los campos de calificación desde el inicio.

Quiero que, al seleccionar “Calificada”, dentro de esta misma ventana actual aparezca un bloque adicional debajo de “Tipo de Registro” o antes del botón principal, con una sección llamada por ejemplo:

“Escala de evaluación”

Y dentro de esa sección solo permitir dos opciones:

1. Escala numérica:
- 5
- 6
- 7
- 8
- 9
- 10

2. Escala por estatus:
- Requiere apoyo
- En proceso
- En desarrollo

No usar escala del 1 al 10.

Después, el botón principal ya no solo debe decir “Crear y Capturar”, sino puede mantenerse igual pero debe ejecutar este flujo:

- guardar la actividad
- abrir automáticamente una segunda pantalla o modal llamado:
  “Captura de evaluación”
  o
  “Registrar calificaciones”

4. NUEVO FLUJO PARA “CALIFICADA”
Diseña la interacción para que cuando el usuario cree una actividad calificada, ocurra esto:

Paso 1:
En la pantalla actual de “Nueva actividad” se captura:
- nombre de la actividad
- campo formativo
- tipo de registro = calificada
- método de captura
- escala de evaluación

Paso 2:
Al tocar “Crear y Capturar”, la actividad debe quedar guardada.

Paso 3:
Se abre una nueva pantalla llamada:
“Captura de evaluación”

5. DISEÑO DE LA PANTALLA “CAPTURA DE EVALUACIÓN”
Esta pantalla debe sentirse coherente con el diseño actual de la app “Acompáñame”.

Debe mostrar:
- nombre de la actividad
- campo formativo
- grupo
- fecha
- tipo de escala elegida

Debe incluir una tabla o lista rápida del grupo con:
- número de lista
- nombre del alumno
- columna de cumplimiento
- columna de evaluación
- observación opcional

La lógica debe ser así:
- si el alumno sí pasó NFC o fue registrado manualmente, en cumplimiento aparece “Entregó”
- si no pasó NFC al cierre, aparece automáticamente “No entregó”
- a los alumnos con “Entregó” sí se les puede asignar evaluación
- a los alumnos con “No entregó” la evaluación queda vacía o bloqueada

6. SI LA ESCALA ES NUMÉRICA 5 A 10
En la columna de evaluación mostrar chips o botones rápidos con:
- 5
- 6
- 7
- 8
- 9
- 10

Debe ser rápido, visual y fácil de tocar en móvil o tablet.

7. SI LA ESCALA ES POR ESTATUS
En la columna de evaluación mostrar chips visuales con:
- Requiere apoyo
- En proceso
- En desarrollo

Con colores semánticos:
- Requiere apoyo = rojo suave
- En proceso = amarillo o naranja
- En desarrollo = verde o azul

8. SI EL MÉTODO DE CAPTURA ES NFC CONTINUO
Mantener la lógica de NFC continuo como base del cumplimiento.
Diseñar el flujo para que:
- la actividad quede abierta
- los niños pasen uno por uno con su tarjeta
- al cierre, quienes no pasaron queden automáticamente como “No entregó”
- después el maestro pueda entrar a la pantalla de “Captura de evaluación” para asignar calificación o estatus a quienes sí entregaron

9. SI EL MÉTODO DE CAPTURA ES MANUAL
Después de crear la actividad calificada, abrir directamente la pantalla “Captura de evaluación” con toda la lista del grupo y permitir capturar rápidamente el valor por alumno.

10. COMPONENTES IMPORTANTES
Agregar visualmente en la nueva pantalla:
- botón “Guardar borrador”
- botón “Finalizar captura”
- opción “Aplicar mismo valor a varios alumnos”
- opción “Editar después”

11. IMPORTANTE
No quiero una propuesta genérica o totalmente nueva.
Quiero que el rediseño use como referencia directa la pantalla actual ya existente en Figma:
- mismo estilo visual
- misma línea gráfica
- misma estructura base
- solo agregando el flujo correcto para “Calificada”
- mejorando la interacción del selector de tipo de registro

12. RESULTADO ESPERADO
Genera una propuesta visual precisa de:
- la pantalla actual de “Nueva actividad” mejorada
- el bloque dinámico que aparece al seleccionar “Calificada”
- la pantalla nueva de “Captura de evaluación”
- una experiencia clara, rápida y realista para docentes

La propuesta debe sentirse como una evolución directa de lo que ya está en Figma, no como otra app distinta.