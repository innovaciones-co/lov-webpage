/**
 * Códigos de error de portabilidad y sus mensajes descriptivos
 * Fuente: Regulación de portabilidad numérica en Colombia
 */
export const PORTABILITY_ERROR_CODES: Record<string, string> = {
    // Errores técnicos generales (ERROR00001-ERROR00050)
    'ERROR00001': 'Causas técnicas del ABD. Esta causa implicará la terminación del proceso sin éxito',
    'ERROR00002': 'Error en el envío del NIP a la red donante',
    'ERROR00003': 'Fallo de envío de mensaje al prestador implicado por no obtención del acuse de recibo. Esta causa implicará la terminación del proceso sin éxito',
    'ERROR00004': 'Proceso no existe',
    'ERROR00005': 'Número de Identificador de proceso ya existe',
    'ERROR00006': 'Número de Identificador de mensaje ya existe',
    'ERROR00007': 'Proceso se encuentra ya cerrado',
    'ERROR00008': 'Mensaje fuera de secuencia (para mensajes que no son del proceso de portabilidad)',
    'ERROR00009': 'Error de formato en mensaje: Prestador en Identificador de proceso no válido',
    'ERROR00010': 'Error de formato en mensaje: Fecha en Identificador de proceso no válido',
    'ERROR00011': 'Error de formato en mensaje: Tipo de proceso en Identificador de proceso no válido',
    'ERROR00012': 'Error de formato en mensaje: Prestador en Identificador de mensaje no válido',
    'ERROR00013': 'Error de formato en mensaje: Fecha en Identificador de mensaje no válido',
    'ERROR00014': 'Error de formato en mensaje: Formato de fecha no válido (aaaammddhhmiss)',
    'ERROR00015': 'Error de formato en mensaje: Tipo de mensaje no válido',
    'ERROR00016': 'Error de formato en mensaje: Identificador de operador emisor no válido',
    'ERROR00017': 'Error de formato en mensaje: Identificador de operador donante no válido',
    'ERROR00018': 'Error de formato en mensaje: Tipo de usuario no válido',
    'ERROR00019': 'Error de formato en mensaje: Tipo de servicio no válido',
    'ERROR00020': 'Error de formato en mensaje: Número no válido',
    'ERROR00021': 'Error de formato en mensaje: Número de enrutamiento no válido',
    'ERROR00022': 'Error de formato en mensaje: Falta NIP',
    'ERROR00023': 'Error de formato en mensaje: Nombre de documentación de soporte no cumple formato',
    'ERROR00024': 'Error de formato en mensaje: Nombre de documentación de solicitud no cumple formato',
    'ERROR00025': 'Error de formato en mensaje: Tipo de documento en nombre de documento adjunto no existe',
    'ERROR00026': 'Error de formato en mensaje: Extensión de documento adjunto no válido',
    'ERROR00027': 'Error de formato en mensaje: Falta documentación adjunta obligatoria',
    'ERROR00028': 'Error de formato en mensaje: Causa de rechazo no válida',
    'ERROR00029': 'Error de formato en mensaje: Falta documentación de soporte de rechazo',
    'ERROR00030': 'Error de formato en mensaje: Tipo de respuesta no válida',
    'ERROR00031': 'Error de formato en mensaje: Tipo de sincronización no válida',
    'ERROR00032': 'Fallo de envío del mensaje desde el ABD al prestador implicado. El operador destino da respuesta diferente a un acuse de recibo. Esta causa implicará la terminación del proceso sin éxito',
    'ERROR00033': 'Mensaje fuera de secuencia. Mensaje 1003 no corresponde a un mensaje 1002',
    'ERROR00034': 'Mensaje fuera de secuencia. Ya se ha recibido un mensaje 1003 con anterioridad',
    'ERROR00035': 'Mensaje fuera de secuencia. Ha finalizado el tiempo de Recepción del mensaje 1003',
    'ERROR00036': 'Mensaje fuera de secuencia. Mensaje 1006 no corresponde a un mensaje 1005',
    'ERROR00037': 'Mensaje fuera de secuencia. Ya se ha recibido un mensaje 1006 con anterioridad',
    'ERROR00038': 'Mensaje fuera de secuencia. Ha finalizado el tiempo de recepción del mensaje 1006',
    'ERROR00039': 'Error de formato en mensaje: Fecha de Expedición del documento de identificación no válido',
    'ERROR00040': 'Error de formato en mensaje: Es obligatorio el número de identificación del representante legal para solicitudes jurídicas',
    'ERROR00041': 'Error de formato en mensaje: Es obligatorio el NIP para solicitudes jurídicas',
    'ERROR00042': 'Rechazo del proceso por operador Donante a través de la solicitud 5001 – Cancelación de un proceso en curso',
    'ERROR00043': 'Error de formato en mensaje: Fecha de Expedición del documento de identificación del representante no válido',
    'ERROR00044': 'Error de formato en mensaje: Es obligatorio la Fecha de Expedición del documento de identificación del representante legal',
    'ERROR00045': 'Error de formato en mensaje: Es obligatorio el tipo de identificación del representante legal para solicitudes jurídicas',
    'ERROR00046': 'Error de formato en mensaje: Es obligatorio la Fecha de Expedición del documento de identificación para el tipo de usuario natural',
    'ERROR00047': 'Error de formato en mensaje: Es obligatorio el tipo de identificación NIT para el tipo de usuario jurídico',
    'ERROR00048': 'Error de formato en mensaje: No es requerido el tipo de identificación NIT para el tipo de usuario natural',
    'ERROR00049': 'Error de formato en mensaje: No es requerido el tipo de identificación NIT para el tipo de identificación del representante legal',
    'ERROR00050': 'Error de formato en el mensaje: El tamaño del archivo supera los 2 MB',

    // Rechazos ABD - Generación de NIP (REC00ABD01-REC00ABD09)
    'REC00ABD01': 'El número ya se encuentra portado al operador receptor que solicita la generación del NIP',
    'REC00ABD02': 'El número ya tiene asociado un NIP vigente en el ABD',
    'REC00ABD03': 'Operador donante difiere del indicado en la solicitud para la lista de numeraciones',
    'REC00ABD04': 'No existe NIP vigente para poder realizar el reenvío',
    'REC00ABD05': 'Se ha superado el número máximo de reenvíos de NIP',
    'REC00ABD06': 'Nunca se ha solicitado NIP para el número indicado',
    'REC00ABD09': 'No han transcurrido 30 días desde la última portación',

    // Rechazos ABD - Solicitud de Portabilidad (REC01ABD01-REC01ABD11)
    'REC01ABD01': 'El NIP indicado en la solicitud de portabilidad no está vigente para la numeración indicada',
    'REC01ABD02': 'El NIP indicado en la solicitud de portabilidad no corresponde con el NIP asociado a la numeración a portar',
    'REC01ABD03': 'Solicitud contiene numeraciones que ya se encuentran en proceso de cambio',
    'REC01ABD04': 'La numeración solicitada ya se encuentra portada al prestador receptor',
    'REC01ABD05': 'No todas las numeraciones solicitadas pertenecen al mismo prestador donante o no hay coincidencia en los números',
    'REC01ABD06': 'Numeración no está asignada a ningún operador',
    'REC01ABD07': 'Número de enrutamiento no válido',
    'REC01ABD08': 'La numeración no tiene asociado un NIP',
    'REC01ABD09': 'NIP no válido – NIP no se puede utilizar en persona jurídica',
    'REC01ABD10': 'NIP no válido – NIP no se puede utilizar en persona natural',
    'REC01ABD11': 'Línea susceptible de 5001',

    // Rechazos ABD - Cambio de Ventana de Portación (REC02ABD01-REC02ABD04)
    'REC02ABD01': 'La numeración no se encuentra en estado portado en la BDR. Este rechazo se producirá siempre y cuando la numeración no se encuentre portada o exista algún otro proceso previamente abierto',
    'REC02ABD02': 'La numeración se encuentra portada a otro operador',
    'REC02ABD03': 'Fecha de ventana propuesta no cumple el plazo permitido',
    'REC02ABD04': 'Fecha de ventana propuesta es festivo',

    // Rechazos ABD - Sincronización (REC03ABD01-REC03ABD03)
    'REC03ABD01': 'Fecha de inicio es mayor que Fecha de fin',
    'REC03ABD02': 'Los campos Fecha inicio y Fecha fin deben estar completados para sincronización incremental',
    'REC03ABD03': 'Los campos Fecha inicio y Fecha fin deben estar vacíos para sincronización completa',

    // Rechazos ABD - Reversión (REC04ABD01-REC04ABD07)
    'REC04ABD01': 'La numeración indicada en la solicitud de reversión ya se encuentra en un proceso en curso',
    'REC04ABD02': 'El prestador solicitante no es ni donante ni receptor actual de la numeración indicada en la solicitud de reversión',
    'REC04ABD03': 'Numeración no está asignada a ningún operador',
    'REC04ABD04': 'Cancelación de reversión por falta de respuesta del otro operador dentro del plazo TR13',
    'REC04ABD05': 'El documento adjunto no contiene la numeración indicada en el mensaje 4001',
    'REC04ABD06': 'Error de formato del mensaje 4001: Falta documentación CUN obligatorio',
    'REC04ABD07': 'El prestador solicitante no es el donante del proceso en curso',

    // Rechazos ABD - Cancelación (REC05ABD01-REC05ABD06)
    'REC05ABD01': 'La numeración indicada en la solicitud ya se encuentra en un proceso en curso',
    'REC05ABD02': 'El prestador solicitante no es el donante del proceso en curso',
    'REC05ABD03': 'Numeración no está asignada a ningún operador',
    'REC05ABD04': 'Error de formato del mensaje 5001: Falta documentación CUN obligatorio',
    'REC05ABD05': 'La fecha de ventana cambio ha superado el límite de tiempo de la ventana de cambio',
    'REC05ABD06': 'Documento CUN no contiene la numeración a cancelarse en el proceso',

    // Rechazos PRT - Prestador (REC01PRT01-REC01PRT09)
    'REC01PRT01': 'Solicitante modalidad prepago/pospago no es el suscriptor del contrato ni está autorizado',
    'REC01PRT02': 'Número reportado como extraviado o hurtado sin reposición de SIM Card',
    'REC01PRT03': 'Número desactivado por fraude',
    'REC01PRT04': 'El número a ser portado se encuentra suspendido por falta de pago',
    'REC01PRT05': 'Línea Desactivada',
    'REC01PRT06': 'Línea Suspendida',
    'REC01PRT07': 'Numeración no asignada',
    'REC01PRT08': 'Numeración no implementada en la red',
    'REC01PRT09': 'Línea prepago sin actividad en la red',

    // Rechazos PRT - Prestador Adicionales (REC04PRT01-REC04PRT02)
    'REC04PRT01': 'Numeración reasignada',
    'REC04PRT02': 'Cliente desea continuar con el operador asignatario',

    // Errores SOAP (ERRSOAP007-ERRSOAP015)
    'ERRSOAP007': 'Error en la recuperación del parámetro receiver. Parámetro no encontrado',
    'ERRSOAP008': 'Error en la recuperación del parámetro typeMsg. Parámetro no encontrado',
    'ERRSOAP009': 'Parámetro receiver no válido',
    'ERRSOAP010': 'Parámetro sender no válido',
    'ERRSOAP011': 'Parámetro typeMsg no válido',
    'ERRSOAP012': 'Formato del mensaje no cumple con el esquema XML',
    'ERRSOAP013': 'No se han recibido los parámetros sender/receiver/typeMsg necesarios',
    'ERRSOAP014': 'Mensaje recibido fuera del horario laboral',
    'ERRSOAP015': 'Error en envío mensaje por no respuesta del servicio del prestador o por tiempos altos de respuesta',
};

/**
 * Obtiene el mensaje de error basado en el código
 * @param errorCode - Código de error (ej: 'ERROR00001', 'REC01PRT01')
 * @returns Mensaje descriptivo del error o null si no se encuentra
 */
export function getPortabilityErrorMessage(errorCode: string): string | null {
    return PORTABILITY_ERROR_CODES[errorCode] || null;
}
