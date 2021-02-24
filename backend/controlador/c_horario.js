const HorarioModelo=require("../modelo/m_horario"),
Moment=require("moment"),
VitacoraControlador=require("./c_vitacora")

const HorarioControlador={}

HorarioControlador.consultarHoraioActivoControlador=async (req,res) => {
    var respuesta_api={horaio:[],mensaje:"",estado_peticion:""}
    const horario_modelo=new HorarioModelo()
    const horario_result=await horario_modelo.consultarHorarioActivoModelo()
    if(HorarioControlador.verificarExistencia(horario_result)){
        respuesta_api.horaio=horario_result.rows[0]
        respuesta_api.mensaje="consulta completada"
        respuesta_api.estado_peticion="200"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="al consultar, no hay horario disponible"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    
}

HorarioControlador.agregarNuevoHorarioControlador=async (req,res,next) => {
    var respuesta_api={mensaje:"registro completado",estado_peticion:"200"}
    const horario_modelo_nuevo=new HorarioModelo()
    const {horario,token} = req.body
    horario_modelo_nuevo.setDatos(horario)
    const datosRegistro=await horario_modelo_nuevo.registrarModelo()
    console.log(datosRegistro)
    if(datosRegistro.rowCount>0){
        respuesta_api.mensaje="registro completado"
        respuesta_api.estado_peticion="200"
        req.vitacora=VitacoraControlador.json(respuesta_api,token,"INSERT","thorario","NEW")
        next()
    }
    else{
        respuesta_api.mensaje="error al registrar"
        respuesta_api.estado_peticion="500"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    
    // res.writeHead(200,{"Content-Type":"application/json"})
    // res.write(JSON.stringify(respuesta_api))
    // res.end()
}

HorarioControlador.verificarExistencia=(result)=>{
    return result.rows.length!=0
}

HorarioControlador.consultarTodosLosHorarios = async (req,res) => {
    var respuesta_api={horarios:[],mensaje:"registro completado",estado_peticion:"200"}
    const horario=new HorarioModelo()
    const datosConsulta=await horario.consultarTodosLosHorarios()
    if(datosConsulta.rowCount>0){
        respuesta_api.horarios=datosConsulta.rows
        respuesta_api.mensaje="consulta completada"
        respuesta_api.estado_peticion="200"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="error al consultar no hay horarios disponibles"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

HorarioControlador.actualizarHorario = async (req,res) => {
    var respuesta_api={mensaje:"",estado_peticion:"200"}
    const {horario,token} = req.body
    const horarioModelo=new HorarioModelo()
    horarioModelo.setDatos(horario)
    const datosActualizacion=await horarioModelo.actualizarHorario()
    if(datosActualizacion.rowCount>0){
        respuesta_api.mensaje="actualización completada"
        respuesta_api.estado_peticion="200"
        req.vitacora=VitacoraControlador.json(respuesta_api,token,"UPDATE","thorario",horario.id_horario)
        next()
        // res.writeHead(200,{"Content-Type":"application/json"})
        // res.write(JSON.stringify(respuesta_api))
        // res.end()
    }
    else{
        respuesta_api.mensaje="error al actualizar"
        respuesta_api.estado_peticion="500"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

// ------------------------------

HorarioControlador.consultarHorarioActivo=async () => {
    const horario_modelo=new HorarioModelo()
    const horario_result=await horario_modelo.consultarHorarioActivoModelo()
    return horario_result
}

HorarioControlador.verificarCumplimentoDeHorario=async (hora) => {
    var estado=false
    const result =await HorarioControlador.consultarHorarioActivo()
    if(HorarioControlador.verificarExistencia(result)){
        const hora_entrada=Moment(result.rows[0].horario_entrada,"HH:mmA")
        if(Moment(hora,"HH:mmA").isSameOrBefore(hora_entrada)){
            estado=true
        }
    }
    return estado
}

module.exports=HorarioControlador