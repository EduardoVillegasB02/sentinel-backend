import { ReportFields } from '../../interfaces';

export function messageDisciplinaryLack(fields: ReportFields) {
  return `Es grato dirigirme a Ud. con la finalidad de informarle lo siguiente:\nSiendo las ${fields.time}, del día ${fields.date}, en la dirección ${fields.address},la persona, ${fields.offender.lastname} ${fields.offender.name}, (${fields.offender.regime}), con cargo ${fields.offender.job}, fue encontrado incurriendo en la presunta falta disciplinaria de ${fields.lack.name}, durante el monitoreo de Control y Supervisión por el CENTINELA ${fields.user.lastname} ${fields.user.lastname} a través del la BODYCAM ${fields.bodycam}.
    
    La BODYCAM ${fields.bodycam} de la persona ${fields.holder}, al cual le fue asignado según el KARDEX, fue la que enfoco al ${fields.offender.job} infringiendo el ${fields.lack.article}.

    Que cita "${fields.lack.description}", ya que el personal operativo debe estar en cumplimiento de sus funciones y deberes durante su jornada laboral, por lo tanto, deberían estar atentos y alertas al punto asignado por si ocurriese alguna emergencia o algún tipo de apoyo.\n\n

    Se adunta al presente. La información de la persona ${fields.offender.lastname} ${fields.offender.name}, las tomas fotográficas de la BODYCAM ${fields.bodycam}.`;
}
