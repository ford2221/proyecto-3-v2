
const moment = require('moment');
moment.locale('es');

const controladorAnoEscolar = {}

controladorAnoEscolar.registrar_ano_escolar = async (req, res) => {
  const respuesta_api = { mensaje: "", estado_respuesta: false, color_alerta: "" };
  const ModeloAnoEscolar = require("../modelo/m_ano_escolar");
  let { anoescolar } = req.body
  let modeloAnoEscolar = new ModeloAnoEscolar()
  modeloAnoEscolar.setDatos(anoescolar)
  let resultAnoEscolar = await modeloAnoEscolar.registrar()
  if (resultAnoEscolar.rowCount > 0) {
    respuesta_api.mensaje = "registro completado"
    respuesta_api.estado_respuesta = true
    respuesta_api.color_alerta = "success"
  }
  else {
    respuesta_api.mensaje = "error al registrar el año escolar"
    respuesta_api.estado_respuesta = false
    respuesta_api.color_alerta = "danger"
  }
  res.writeHead(200, { "Content-Type": "application/json" })
  res.write(JSON.stringify(respuesta_api))
  res.end()
}

controladorAnoEscolar.consultar_todos = async (req, res) => {
  const respuesta_api = { mensaje: "", datos: [], estado_respuesta: false, color_alerta: "" }
  const ModeloAnoEscolar = require("../modelo/m_ano_escolar");
  let modeloAnoEscolar = new ModeloAnoEscolar()
  let resultAnoEscolar = await modeloAnoEscolar.consultarTodos()

  if (resultAnoEscolar.rowCount > 0) {
    respuesta_api.mensaje = "consulta completada"
    respuesta_api.datos = resultAnoEscolar.rows
    respuesta_api.estado_respuesta = true
    respuesta_api.color_alerta = "success"
  }
  else {
    respuesta_api.mensaje = "no se a encontrado registro en la base de datos"
    respuesta_api.estado_respuesta = false
    respuesta_api.color_alerta = "danger"
  }
  res.writeHead(200, { "Content-Type": "application/json" })
  res.write(JSON.stringify(respuesta_api))
  res.end()
}

controladorAnoEscolar.getDateNow = async (req, res) => {
  // const respuesta_api = { mensaje: "", datos: [], estado_respuesta: false, color_alerta: "" }

  const hoy = moment();

  const formato = 'YYYY-MM-DD';
  const fecha = await hoy.format(formato)
  //console.log({ data: fecha });
  res.json({ 
    mensaje: 'consulta completada',
    datos: fecha,
    estado_respuesta: true,
    color_alerta: "success"
  })
}


controladorAnoEscolar.consultar= async (req, res) => {
  const respuesta_api = { mensaje: "", datos: [], estado_respuesta: false, color_alerta: "" }
  const ModeloAnoEscolar = require("../modelo/m_ano_escolar");
  let {id} = req.params
  let modeloAnoEscolar = new ModeloAnoEscolar()
  modeloAnoEscolar.setIdAnoEscolar(id)
  let resultAnoEscolar = await modeloAnoEscolar.consultar()

  if (resultAnoEscolar.rowCount > 0) {
    respuesta_api.mensaje = "consulta completada"
    respuesta_api.datos = resultAnoEscolar.rows
    respuesta_api.estado_respuesta = true
    respuesta_api.color_alerta = "success"
  }
  else {
    respuesta_api.mensaje = "no se a encontrado registro en la base de datos"
    respuesta_api.estado_respuesta = false
    respuesta_api.color_alerta = "danger"
  }
  res.writeHead(200, { "Content-Type": "application/json" })
  res.write(JSON.stringify(respuesta_api))
  res.end()
}

controladorAnoEscolar.consultarAnoEscolarActivo= async (req, res) => {
  const respuesta_api = { mensaje: "", datos: [], estado_respuesta: false, color_alerta: "" }
  const ModeloAnoEscolar = require("../modelo/m_ano_escolar");
  let modeloAnoEscolar = new ModeloAnoEscolar()
  let resultAnoEscolar = await modeloAnoEscolar.consultarAnoEscolarActivo()

  if (resultAnoEscolar.rowCount > 0) {
    respuesta_api.mensaje = "consulta completada"
    respuesta_api.datos = resultAnoEscolar.rows
    respuesta_api.estado_respuesta = true
    respuesta_api.color_alerta = "success"
  }
  else {
    respuesta_api.mensaje = "no se a encontrado registro en la base de datos"
    respuesta_api.estado_respuesta = false
    respuesta_api.color_alerta = "danger"
  }
  res.writeHead(200, { "Content-Type": "application/json" })
  res.write(JSON.stringify(respuesta_api))
  res.end()
}

controladorAnoEscolar.consultarpatron = async (req, res) => {
  const respuesta_api = { mensaje: "", datos: [], estado_respuesta: false, color_alerta: "" }
  const ModeloAnoEscolar = require("../modelo/m_ano_escolar");
  const patron = req.params.patron
  let modeloAnoEscolar = new ModeloAnoEscolar()
  let resultAnoEscolar = await modeloAnoEscolar.consultarpatron(patron)

  if (resultAnoEscolar.rowCount > 0) {
    respuesta_api.mensaje = "consulta completada"
    respuesta_api.datos = resultAnoEscolar.rows
    respuesta_api.estado_respuesta = true
    respuesta_api.color_alerta = "success"
  }
  else {
    respuesta_api.mensaje = "no se a encontrado registro en la base de datos"
    respuesta_api.estado_respuesta = false
    respuesta_api.color_alerta = "danger"
  }
  res.writeHead(200, { "Content-Type": "application/json" })
  res.write(JSON.stringify(respuesta_api))
  res.end()
}

controladorAnoEscolar.actualizar = async (req, res) => {
  const respuesta_api = { mensaje: "", estado_respuesta: false, color_alerta: "" }
  const ModeloAnoEscolar = require("../modelo/m_ano_escolar");
  let { anoescolar } = req.body
  let { id } = req.params
  let modeloAnoEscolar = new ModeloAnoEscolar()
  modeloAnoEscolar.setDatos(anoescolar)
  modeloAnoEscolar.setIdAnoEscolar(id)

  let resultAnoEscolar = await modeloAnoEscolar.actualizar()

  if (resultAnoEscolar.rowCount > 0) {
    let resultAnoEscolar2 = await modeloAnoEscolar.actualizar()
    if (resultAnoEscolar2.rowCount > 0) {
      respuesta_api.mensaje = "actualización completada"
      respuesta_api.estado_respuesta = true
      respuesta_api.color_alerta = "success"
    }
    else {
      respuesta_api.mensaje = "error al actualizar"
      respuesta_api.estado_respuesta = false
      respuesta_api.color_alerta = "danger"
    }
  }
  else {
    respuesta_api.mensaje = "error al actualizar (este registro no se encuentra en la base de datos)"
    respuesta_api.estado_respuesta = false
    respuesta_api.color_alerta = "warning"
  }
  res.writeHead(200, { "Content-Type": "application/json" })
  res.write(JSON.stringify(respuesta_api))
  res.end()
}

module.exports = controladorAnoEscolar