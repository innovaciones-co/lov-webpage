/**
 * Estados de portabilidad y sus mensajes descriptivos
 */
export const PORTABILITY_STATES: Record<string, string> = {
    // Estados de solicitud de salida (Port Out)
    'PortOutRequestReceived': 'Solicitud de portabilidad recibida',
    'PortOutWaitingForApproval': 'Esperando aprobación de la portabilidad',
    'PortReadyForScheduling': 'Listo para programar la portabilidad',
    'PortScheduled': 'Portabilidad programada',
    'PortReadyForExecution': 'Listo para ejecutar la portabilidad',
    'PortExecuting': 'Ejecutando la portabilidad',
    'PortSuccessful': 'Portabilidad completada exitosamente',

    // Estados de NIP
    'NipRequestSent': 'Solicitud de NIP enviada',
    'NipSent': 'NIP enviado al usuario',

    // Estados de solicitud de entrada (Port In)
    'PortInRequested': 'Portabilidad solicitada',
    'PortInAbdAccepted': 'Portabilidad aceptada por el administrador',
    'PortInAbdRejected': 'Portabilidad rechazada por el administrador',
    'PortFailed': 'Portabilidad fallida',
};

/**
 * Obtiene el mensaje de estado basado en el código
 * @param stateCode - Código de estado (ej: 'PortOutRequestReceived', 'NipSent')
 * @returns Mensaje descriptivo del estado o null si no se encuentra
 */
export function getPortabilityStateMessage(stateCode: string): string | null {
    return PORTABILITY_STATES[stateCode] || null;
}

