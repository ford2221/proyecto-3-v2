const PermisoTrabajadorModelo=require("../modelo/m_permiso_trabajador"),
TrabajadorControlador=require("./c_trabajador"),
PermisoControlador=require("./c_permiso"),
VitacoraControlador=require("./c_vitacora"),
Moment=require("moment")

const PermisoTrabajadorControlador={}

PermisoTrabajadorControlador.fechaActual=async (req,res)=>{
    const Moment=require("moment")
    res.writeHead(200,{"Content-Type":"application/json"})
    res.write(JSON.stringify({
        fechaServidor:Moment().format("YYYY-MM-DD")
    }))
    res.end()
}
PermisoTrabajadorControlador.generarId=async (req,res)=>{
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const hoy=Moment().format("DD-MM-YYYY")
    permiso=await PERMISOTRABAJADOR.consultarTodosModelo(hoy)
    const id=`pert-${(permiso.rows.length)+1}-${hoy}`
    res.writeHead(200,{"Content-Type":"application/json"})
    res.write(JSON.stringify({id:id}))
    res.end()
}

PermisoTrabajadorControlador.registrarControlador=async (req,res,next)=>{
    let ano=Moment().format("YYYY")
    let mes=Moment().format("MM-YYYY")
    const {permiso_trabajador,token}=req.body
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    var respuesta_api={mensaje:"solicitud enviada con exito",estado_peticion:"200"}
    let numerosPermisosAno=await PERMISOTRABAJADOR.consultarNumerosDePermiso(ano,permiso_trabajador.id_cedula)
    let numerosPermisosMes=await PERMISOTRABAJADOR.consultarNumerosDePermiso2(mes)
    // console.log("=>>> ",numerosPermisosAno.rowCount)
    // console.log("=>>> ",numerosPermisosMes.rowCount)
    if(numerosPermisosAno.rowCount<=10){
        if(numerosPermisosMes.rowCount<=3){
            ReposoTrabajadorControlador=require("./c_reposo_trabajador")
                AsistenciaControlador=require("./c_asistencia")
                PERMISOTRABAJADOR.set_datos(permiso_trabajador)
                const permiso=await PERMISOTRABAJADOR.consultarPermisoTrabajadorModelo()
                if(permiso.rows.length===0){
                        const permiso_2=await PERMISOTRABAJADOR.consultarPermisoTrabajadorXCedulaActivolModelo()
                    if(permiso_2.rows.length===0){
                        const trabajador_controlador=new TrabajadorControlador()
                        const respuesta_trabajador=await trabajador_controlador.consultar(permiso_trabajador.id_cedula)
                        if(respuesta_trabajador){
                            const permiso_controlador=new PermisoControlador()
                            const respuesta_permiso=await permiso_controlador.consultar(permiso_trabajador.id_permiso)
                            if(respuesta_permiso){
                                const reposo_trabajador_result=await ReposoTrabajadorControlador.consultarReposoActivo(permiso_trabajador.id_cedula)
                                if(!PermisoTrabajadorControlador.verificarExistencia(reposo_trabajador_result)){
                                    let permiso_result3=await PERMISOTRABAJADOR.consultarTodosLosPermisosTrabajador()
                                    let numeroPermiso=permiso_result3.rowCount+1
                                    PERMISOTRABAJADOR.registrarModelo(numeroPermiso)
                                    req.vitacora=VitacoraControlador.json(respuesta_api,token,"INSERT","tpermisotrabajador",permiso_trabajador.id_permiso_trabajador)
                                    next()
                                }
                                else{
                                    respuesta_api.mensaje="error al registrar , por que el trabajador tiene un reposo activo"
                                    respuesta_api.estado_peticion="500"
                                    res.writeHead(200,{"Content-Type":"application/json"})
                                    res.write(JSON.stringify(respuesta_api))
                                    res.end()
                                }
                            }
                            else{
                                respuesta_api.mensaje="no esta el permiso registrado o no esta activo"
                                respuesta_api.estado_peticion="500"
                                res.writeHead(200,{"Content-Type":"application/json"})
                                res.write(JSON.stringify(respuesta_api))
                                res.end()
                            }
                        }
                        else{
                            respuesta_api.mensaje="el trabajador no esta registrrado o no esta activo"
                            respuesta_api.estado_peticion="500"
                            res.writeHead(200,{"Content-Type":"application/json"})
                            res.write(JSON.stringify(respuesta_api))
                            res.end()
                        }
                    }
                    else if(permiso_2.rows.length===1){
                        respuesta_api.mensaje="este usuario ya tiene un permiso activo"
                        respuesta_api.estado_peticion="500"
                        res.writeHead(200,{"Content-Type":"application/json"})
                        res.write(JSON.stringify(respuesta_api))
                        res.end()
                    }
                    else if(permiso_2.rows.length>=1){
                        respuesta_api.mensaje="por alguna razon este usuario tiene mas de un permis activo porfavor notificar al personal de sistema"
                        respuesta_api.estado_peticion="500"
                        res.writeHead(200,{"Content-Type":"application/json"})
                        res.write(JSON.stringify(respuesta_api))
                        res.end()
                    }
                }
                else{
                    respuesta_api.mensaje="ya hay un registro con este id"
                    respuesta_api.estado_peticion="500"
                    res.writeHead(200,{"Content-Type":"application/json"})
                    res.write(JSON.stringify(respuesta_api))
                    res.end()
                }
        }
        else{
            respuesta_api.mensaje="llegaste al minimo de permiso por mes e los cuales son 3"
            respuesta_api.estado_peticion="404"
            res.writeHead(200,{"Content-Type":"application/json"})
            res.write(JSON.stringify(respuesta_api))
            res.end()
        }
    }
    else{
        respuesta_api.mensaje="llegaste al minimo de permiso por año de los cuales son 10"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}
    
        

PermisoTrabajadorControlador.consultarPermisoTrabajadorXCedulaEstatuControlador=async (req,res)=>{
    var respuesta_api={permiso_trabajador:[],mensaje:"solicitud enviada con exito",estado_peticion:"200"}
    const id_cedula=req.params.id
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    let permiso_result=await PERMISOTRABAJADOR.consultarPermisosTrabajadorPorNumeroPermiso(id_cedula)
    // console.log(permiso_result)
    if(permiso_result.rowCount>0){
        const ultimoPermiso=permiso_result.rows[(permiso_result.rows.length-1)]
        // console.log(ultimoPermiso)
        let numeroPermiso=ultimoPermiso.numero_permiso
        let permiso_result2=await PERMISOTRABAJADOR.consultarPermisosPorNumeroPermisoYCedula(id_cedula,numeroPermiso)
        // console.log(permiso_result2)
        if(permiso_result2.rows[0].estatu_permiso_trabajador==="E"){
            respuesta_api.mensaje="su permiso todavia esta en espera"
            respuesta_api.estado_peticion="404"
            respuesta_api.permiso_trabajador=permiso_result2.rows
            res.writeHead(200,{"Content-Type":"application/json"})
            res.write(JSON.stringify(respuesta_api))
            res.end()
        }
        else if(permiso_result2.rows[0].estatu_permiso_trabajador==="A"){
            respuesta_api.mensaje="su permiso a sido aprovado"
            respuesta_api.estado_peticion="200"
            respuesta_api.permiso_trabajador=permiso_result2.rows
            res.writeHead(200,{"Content-Type":"application/json"})
            res.write(JSON.stringify(respuesta_api))
            res.end()
        }
        else if(permiso_result2.rows[0].estatu_permiso_trabajador==="D"){
            respuesta_api.mensaje="su permiso a sido denegado"
            respuesta_api.estado_peticion="200"
            respuesta_api.permiso_trabajador=permiso_result2.rows
            res.writeHead(200,{"Content-Type":"application/json"})
            res.write(JSON.stringify(respuesta_api))
            res.end()
        }
        else if(permiso_result2.rows[0].estatu_permiso_trabajador==="C"){
            respuesta_api.mensaje="su permiso a culminado"
            respuesta_api.estado_peticion="200"
            respuesta_api.permiso_trabajador=permiso_result2.rows
            res.writeHead(200,{"Content-Type":"application/json"})
            res.write(JSON.stringify(respuesta_api))
            res.end()
        }
        else if(permiso_result2.rows[0].estatu_permiso_trabajador==="I"){
            respuesta_api.mensaje="su permiso fue interumpido"
            respuesta_api.estado_peticion="404"
            respuesta_api.permiso_trabajador=permiso_result2.rows
            res.writeHead(200,{"Content-Type":"application/json"})
            res.write(JSON.stringify(respuesta_api))
            res.end()
        }
    }
    else{
        respuesta_api.mensaje="no a solicitado nigun permiso"
        respuesta_api.estado_peticion="200"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    
    // const permiso_en_espera=await PermisoTrabajadorControlador.buscarUltimoPermiso(id_cedula,"E")
    // const permiso_apropavado=await PermisoTrabajadorControlador.buscarUltimoPermiso(id_cedula,"A")
    // const permiso_denegado=await PermisoTrabajadorControlador.buscarUltimoPermiso(id_cedula,"D")
    // const permiso_culminado=await PermisoTrabajadorControlador.buscarUltimoPermiso(id_cedula,"C")
    
    
}

PermisoTrabajadorControlador.buscarUltimoPermiso=async (cedula,estatu)=>{
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const permiso=await PERMISOTRABAJADOR.consultarPermisoTrabajadorXCedulaEstatuModelo(cedula,estatu)
    if(permiso.rows.length===1){
        return permiso.rows
    }
    else{
        return []
    }
}

PermisoTrabajadorControlador.consultaPermisoTrabajadorControlador=async (req,res,next)=>{
    const {id,token}=req.params
    var respuesta_api={permiso_trabajador:"",mensaje:"consulta completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    PERMISOTRABAJADOR.set_datoIdPermisoTrabajador(id)
    const permiso=await PERMISOTRABAJADOR.consultarPermisoTrabajadorModelo()
    if(permiso.rows.length!=0){
        respuesta_api.permiso_trabajador=permiso.rows[0]
        req.vitacora=VitacoraControlador.json(respuesta_api,token,"SELECT","tpermisotrabajador",id)
        next()
    }
    else{
        respuesta_api.mensaje="el permiso consultado no existe en la base de datos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.actualizarEstatuPermisoControlador=async (req,res,next)=>{
    // const id=req.params.id
    const {permiso_trabajador,token}=req.body
    var respuesta_api={mensaje:"actualizacion de estatu del permiso completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    PERMISOTRABAJADOR.set_datosActualizarPermiso(permiso_trabajador)
    const permiso= await PERMISOTRABAJADOR.consultarPermisoTrabajadorModelo()
    if(permiso.rows.length===1){
        if(permiso_trabajador.estatu_permiso_trabajador==="A" && permiso.rows[0].permiso_trabajador_tipo==="PR"){
            let datos = await AsistenciaControlador.asignarPermisoRetiroAsistencia(Moment().format("YYYY-MM-DD"),permiso.rows[0].id_cedula,permiso.rows[0].id_permiso_trabajador,Moment().format("HH:mmA"))
            if(datos.rowCount>0){
                // console.log("salida ok")
                PERMISOTRABAJADOR.actualizarEstatuPermisoModelo()
            }
            else{
                // console.log("no ok")
                respuesta_api.mensaje="no se puedo aprobar el permiso por que el trabajador no esta en la asistencia de hoy"
                respuesta_api.estado_peticion="404"
                res.writeHead(200,{"Content-Type":"application/json"})
                res.write(JSON.stringify(respuesta_api))
                res.end()
            }
        }
        else{
            PERMISOTRABAJADOR.actualizarEstatuPermisoModelo()
        }
        req.vitacora=VitacoraControlador.json(respuesta_api,token,`UPDATE`,"tpermisotrabajador",permiso_trabajador.id_permiso_trabajador)
        next()
        
    }
    else{
        respuesta_api.mensaje="el permiso consultado no existe en la base de datos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.consultarPermisoHoyControlador=async (req,res)=>{
    const mesActual=Moment().format("MM-YYYY")
    const mesAnterios=Moment().subtract(1,"months").format("MM-YYYY"),
    estatu=req.params.estatu
    var respuesta_api={permisos_trabajador:[],mensaje:"actualizacion de estatu permiso completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const permiso=await PERMISOTRABAJADOR.consultarPermisoHoyModelo(mesActual,mesAnterios,estatu)
    if(permiso.rows.length!=0){
        respuesta_api.permisos_trabajador=permiso.rows
        respuesta_api.mensaje="consulta completada"
        respuesta_api.estado_peticion="200"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="no hay permisos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.consultarPermisosXFechaControlador=async (req,res)=>{
    const fecha_desde=req.params.desde,
    fecha_hasta=req.params.hasta
    var respuesta_api={reporte:[],mensaje:"consulta completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    PERMISOTRABAJADOR.set_datoFechas(fecha_desde,fecha_hasta)
    const permiso=await PERMISOTRABAJADOR.consultarPermisosXFechaModelo(fecha_desde,fecha_hasta)
    if(permiso.rows.length!=0){
        respuesta_api.reporte=permiso.rows
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="no hay permisos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.consultarMensualControlador=async (req,res)=>{
    const mes=Moment().format("MM-YYYY")
    var respuesta_api={reporte:[],mensaje:"consulta completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const permiso=await PERMISOTRABAJADOR.consultarMensualModelo(mes)
    if(permiso.rows.length!=0){
        respuesta_api.reporte=permiso.rows
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="no hay permisos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.actualizarDiasAvilesPermiso=async (req,res,next)=>{
    const {id}=req.params
    var respuesta_api={mensaje:"actualizacion de estatu permiso completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    PERMISOTRABAJADOR.set_datoIdPermisoTrabajador(id)
    const permiso= await PERMISOTRABAJADOR.consultarPermisoTrabajadorModelo()
    if(permiso.rows.length===1){
        const {permiso_trabajador,token}=req.body
        permiso_trabajador.permiso_trabajador_dias_aviles=(permiso_trabajador.permiso_trabajador_dias_aviles==="0")?"NO":permiso_trabajador.permiso_trabajador_dias_aviles
        PERMISOTRABAJADOR.actualizarDiasPermisoModelo(permiso_trabajador.permiso_trabajador_dias_aviles,permiso_trabajador.fecha_hasta_permiso_trabajador,permiso_trabajador.id_permiso_trabajador)
        req.vitacora=VitacoraControlador.json(respuesta_api,token,"UPDATE","tpermisotrabajador",permiso_trabajador.id_permiso_trabajador)
        next()
    }
    else{
        respuesta_api.mensaje="el permiso consultado no existe en la base de datos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.caducarPermisoTrabajadorControlador=async (req,res)=>{
    const {hasta}=req.params
    var respuesta_api={mensaje:"",estado_peticion:""}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const permiso_result= await PERMISOTRABAJADOR.consultarTodosPermisosFechaModelo(hasta)
    if(PermisoTrabajadorControlador.verificarExistencia(permiso_result)){
        var contador=0
        while(contador<permiso_result.rows.length){
            const permiso=permiso_result.rows[contador]
            PERMISOTRABAJADOR.set_datoIdPermisoTrabajador(permiso.id_permiso_trabajador)
            PERMISOTRABAJADOR.actualizarCaducarPermisoModelo()
            contador++
        }
        respuesta_api.mensaje=`hoy ${hasta} sean caducado ${contador} ${(contador<=1)?'permiso':'permisos'}`
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="no hay nigun para caducar hoy :)"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.consultarPermisoTrabajadorFechaDesdeHasta=async (req,res,next)=>{
    const {cedula,desde,hasta,token}=req.params
    var respuesta_api={reportes:[],mensaje:"consulta completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    PERMISOTRABAJADOR.setCedulaPermiso(cedula)
    PERMISOTRABAJADOR.set_datoFechas(desde,hasta)
    const permiso=await PERMISOTRABAJADOR.consultarPermisosXFechaModelo()
    if(permiso.rows.length!=0){
        respuesta_api.reportes=permiso.rows
        req.vitacora=VitacoraControlador.json(respuesta_api,token,"SELECT","tpermisotrabajador",cedula)
        next()
    }
    else{
        respuesta_api.mensaje="no hay permisos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}


PermisoTrabajadorControlador.verificarExistencia= (result) => {
    return result.rows.length!=0
}

//consultarPermisoTrabajadorXCedulaActivolModelo
PermisoTrabajadorControlador.tumbarPermisoPorReposo=async  (permiso) => {
    console.log(permiso)
    let Permsio=new PermisoTrabajadorModelo()
    Permsio.set_datos(permiso.rows[0])
    return await Permsio.tumbarPermisoPorReposo()
}

PermisoTrabajadorControlador.consultarPermisosActivos=async () => {
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const permiso_result=await PERMISOTRABAJADOR.consultarTodosActivoModelo()
    return permiso_result
}

PermisoTrabajadorControlador.consultarPermisoActivos=async (cedula) => {
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    PERMISOTRABAJADOR.setCedulaPermiso(cedula)
    const permiso_result=await PERMISOTRABAJADOR.consultarPermisoTrabajadorXCedulaActivolModelo()
    return permiso_result
}

PermisoTrabajadorControlador.verificarVencimiento=async (req,res) => {
    // consultarRepososActivos
    let info={
        permisosCaducados:[],
        numeroDePermisosCaducados:0
    }
    const hoy=Moment()
    // console.log(hoy)
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    let datosConsultaPermisos=await PERMISOTRABAJADOR.consultarTodosPermisoAprovados()
    let permisos=datosConsultaPermisos.rows
    // console.log("permisos =>>> ",permisos)
    for(let permiso of permisos){
        
        let fechaPermiso=Moment(permiso.fecha_hasta_permiso_trabajador)
        if(hoy.isAfter(fechaPermiso)){
            console.log("OK")
            info.permisosCaducados.push(permiso)
            info.numeroDePermisosCaducados+= 1
            PERMISOTRABAJADOR.set_datoIdPermisoTrabajador(permiso.id_permiso_trabajador)
            PERMISOTRABAJADOR.actualizarCaducarPermisoModelo()
        }
        // // console.log("datos reposo =>>> ",reposo)
    }
    res.writeHead(200,{"Content-Type":"application/json"})
    res.write(JSON.stringify(info))
    res.end()
}

PermisoTrabajadorControlador.consultarPermisosCulminadosHoy= async (req,res) => {
    var respuesta_api={permisos_trabajador:[],mensaje:"actualizacion de estatu permiso completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const permiso=await PERMISOTRABAJADOR.consultarPermisoCulminadosHoy()
    if(permiso.rows.length!=0){
        respuesta_api.permisos_trabajador=permiso.rows
        respuesta_api.mensaje="consulta completada"
        respuesta_api.estado_peticion="200"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="no hay permisos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.consultarPermisosAprovadosTodos= async (req,res) => {
    var respuesta_api={permisos_trabajador:[],mensaje:"actualizacion de estatu permiso completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    const permiso=await PERMISOTRABAJADOR.consultarPermisoAprovadosTodos()
    if(permiso.rows.length!=0){
        respuesta_api.permisos_trabajador=permiso.rows
        respuesta_api.mensaje="consulta completada"
        respuesta_api.estado_peticion="200"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="no hay permisos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}

PermisoTrabajadorControlador.interumpirPermisoTrabajador= async (req,res,next) => {
    let {id,token}=req.body
    var respuesta_api={mensaje:"actualizacion de estatu permiso completada",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    let permiso_result=await PERMISOTRABAJADOR.interumpirPermiso(id)
    if(permiso_result.rowCount>0){
        respuesta_api.mensaje="El permiso a sido interumpido exitosamente"
        respuesta_api.estado_peticion="200"
        req.vitacora=VitacoraControlador.json(respuesta_api,token,"UPDATE","tpermisotrabajador",id)
        next()
        // res.writeHead(200,{"Content-Type":"application/json"})
        // res.write(JSON.stringify(respuesta_api))
        // res.end()
    }
    else{
        respuesta_api.mensaje="error al interumpir el permiso"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
}


PermisoTrabajadorControlador.consultarTodoLosPermisos= async (req,res) => {
    const {id_cedula} = req.body
    var respuesta_api={datos:[],mensaje:"",estado_peticion:"200"}
    const PERMISOTRABAJADOR=new PermisoTrabajadorModelo()
    let permisosoResult=await PERMISOTRABAJADOR.consultarPermisosTrabajadorPorNumeroPermiso2(id_cedula)
    // console.log(permisosoResult.rows)
    let permisos=[]
    if(permisosoResult.rowCount>0){
        for(let permiso of permisosoResult.rows){
            let numeroPermiso=permiso.numero_permiso
            let permisosoResult2=await PERMISOTRABAJADOR.consultarPermisosPorNumeroPermisoYCedula2(id_cedula,numeroPermiso)
            permisos.push(permisosoResult2.rows[0])
        }
        respuesta_api.datos=permisos.reverse()
        respuesta_api.mensaje="permisos consultados"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    else{
        respuesta_api.mensaje="no tiene permisos"
        respuesta_api.estado_peticion="404"
        res.writeHead(200,{"Content-Type":"application/json"})
        res.write(JSON.stringify(respuesta_api))
        res.end()
    }
    // console.log(permisos)

}

module.exports= PermisoTrabajadorControlador