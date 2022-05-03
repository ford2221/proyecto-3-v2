import React from 'react';
import {withRouter} from 'react-router-dom'
//css
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-grid.css'
import '../css/componentProfesor.css'
//JS
import axios from 'axios'
import Moment from 'moment'
import $ from 'jquery'
// IP servidor
import servidor from '../ipServer.js'
//componentes
import ComponentDashboard from './componentDashboard'
//sub componentes
import AlertBootstrap from "../subComponentes/alertBootstrap"
import InputButton from '../subComponentes/input_button'
import TituloModulo from '../subComponentes/tituloModulo'
import Tabla from '../subComponentes/componentTabla'
import ButtonIcon from '../subComponentes/buttonIcon'
import ComponentFormDate from '../subComponentes/componentFormDate'
import ComponentFormSelect from '../subComponentes/componentFormSelect';

const axiosCustom=axios.create({
    baseURL:`http://${servidor.ipServidor}:${servidor.servidorNode.puerto}/`
})

class ComponentRetiro extends React.Component {


    constructor(){
        super()
        this.mostrarModulo=this.mostrarModulo.bind(this)
        this.redirigirFormulario=this.redirigirFormulario.bind(this)
        this.irAlFormularioDeActualizacion=this.irAlFormularioDeActualizacion.bind(this)
        this.consultarRetiros = this.consultarRetiros.bind(this)
        this.cambiarEstado = this.cambiarEstado.bind(this)
        this.generarPdfRetiro = this.generarPdfRetiro.bind(this)
        this.state={
            modulo:"",
            estado_menu:false,
            fecha_desde: Moment().subtract(1,"M").format("YYYY-MM-DD"),
            fecha_hasta: Moment().format("YYYY-MM-DD"),
            estado_retiros: "E",
            estados:[
              {id: "E", descripcion: "En espera"},{id: "R", descripcion: "Rechazado"},{id: "A", descripcion: "Aprobado"}
            ],
            registros:[],
            //
            fecha_maxima:Moment().format("YYYY-MM-DD"),
            fecha_minima:Moment().subtract(1,"y").format("YYYY-MM-DD"),
            //
            alerta:{
                color:null,
                mensaje:null,
                estado:false
            },
            nombre_usuario:null,
            id_cedula:null
        }
    }

    // logica menu
    mostrarModulo(a){
        var span=a.target;
        if(this.state.modulo===""){
            const estado="true-"+span.id;
            this.setState({modulo:estado,estado_menu:true});
        }
        else{
            var modulo=this.state.modulo.split("-");
            if(modulo[1]===span.id){
        if(this.state.estado_menu){
            const estado="false-"+span.id
            this.setState({modulo:estado,estado_menu:false})
        }
        else{
            const estado="true-"+span.id
            this.setState({modulo:estado,estado_menu:true})
        }
            }
            else{
        if(this.state.estado_menu){
            const estado="true-"+span.id
            this.setState({modulo:estado})
        }
        else{
            const estado="true-"+span.id
            this.setState({modulo:estado,estado_menu:true})
        }
            }
        }
    }

    async componentWillMount(){
        let acessoModulo=await this.validarAccesoDelModulo("/dashboard/transaccion","/retiro")
        if(acessoModulo){
            await this.consultarRetiros()
        }
        else{
            alert("no tienes acesso a este modulo(sera redirigido a la vista anterior)")
            this.props.history.goBack()
        }
    }

    async validarAccesoDelModulo(modulo,subModulo){
        // /dashboard/configuracion/acceso
        let estado = false
          if(localStorage.getItem("usuario")){
            var respuesta_servior=""
            const token=localStorage.getItem("usuario")
            await axios.get(`http://${servidor.ipServidor}:${servidor.servidorNode.puerto}/login/verificar-sesion${token}`)
            .then(async respuesta=>{
                respuesta_servior=respuesta.data
                if(respuesta_servior.usuario){
                    this.setState({id_cedula:respuesta_servior.usuario.id_cedula})
                    this.setState({nombre_usuario:respuesta_servior.usuario.nombre_usuario})
                  estado=await this.consultarPerfilTrabajador(modulo,subModulo,respuesta_servior.usuario.id_perfil)
                }
            })
        }
        return estado
      }

      async consultarPerfilTrabajador(modulo,subModulo,idPerfil){
        let estado=false
        await axios.get(`http://${servidor.ipServidor}:${servidor.servidorNode.puerto}/configuracion/acceso/consultar/${idPerfil}`)
        .then(repuesta => {
            let json=JSON.parse(JSON.stringify(repuesta.data))
            // console.log("datos modulos =>>>",json)
            let modulosSistema={}
            let modulosActivos=json.modulos.filter( modulo => {
                if(modulo.estatu_modulo==="1"){
                    return modulo
                }
            })
            // console.log("datos modulos =>>>",modulosActivos);
            for(let medulo of modulosActivos){
                if(modulosSistema[medulo.modulo_principal]){
                    modulosSistema[medulo.modulo_principal][medulo.sub_modulo]=true
                }
                else{
                    modulosSistema[medulo.modulo_principal]={}
                    modulosSistema[medulo.modulo_principal][medulo.sub_modulo]=true
                }
            }
            console.log(modulosSistema)
            if(modulosSistema[modulo][subModulo]){
              estado=true
            }
            // this.setState({modulosSistema})


        })
        .catch(error =>  {
            console.log(error)
        })
        return estado
    }

    async consultarRetiros(){
      await axiosCustom.get(`transaccion/retiro/consultar-por-estado/${this.state.estado_retiros}/${this.state.fecha_desde}/${this.state.fecha_hasta}`)
      .then(respuesta => {
          let json=JSON.parse(JSON.stringify(respuesta.data))
          this.setState({registros: json.datos})
      })
      .catch(error => {
          console.error("error al conectar con el servidor")
      })
    }

    redirigirFormulario(a){
        this.props.history.push("/dashboard/transaccion/retiro/registrar")
    }

    irAlFormularioDeActualizacion(a){
        let input=a.target
        this.props.history.push(`/dashboard/transaccion/retiro/actualizar/${input.id}`)
    }

    cambiarEstado({target}){
      this.setState({[target.name]:target.value})
      setTimeout( () => {
        this.consultarRetiros();
      }, 100)
    }

    generarPdfRetiro(a){
        let $filaVerPdf=document.getElementById("filaVerPdf")
        let boton=a.target
        // alert(boton.id)
        let datos=[]
        datos.push({name:"nombre_usuario",value:this.state.nombre_usuario})
        datos.push({name:"cedula_usuario",value:this.state.id_cedula})
        datos.push({name:"id_retiro",value:boton.id})
        console.log(datos)
        $.ajax({
          url: `http://${servidor.ipServidor}:${servidor.servidorApache.puerto}/proyecto/backend/controlador_php/controlador_retiro.php`,
          type:"post",
          data:datos,
          success: function(respuesta) {
              console.log(respuesta)
              let json=JSON.parse(respuesta)
              console.log("datos reporte martricula =>>>> ",json)
              if(json.nombrePdf!=="false"){
                    $("#modalPdf").modal("show")
                    $filaVerPdf.classList.remove("ocultarFormulario")
                    document.getElementById("linkPdf").href=`http://${servidor.ipServidor}:${servidor.servidorNode.puerto}/reporte/${json.nombrePdf}`
              }
              else{
                  $filaVerPdf.classList.add("ocultarFormulario")
                  alert("no se pudo generar el pdf por que no hay registros que coincidan con los datos enviados")
              }
          },
          error: function() {
          //   alert("error")
            // $filaVerPdf.classList.add("ocultarFormulario")
          }
        });
      }

    render(){

        const jsx_tabla_encabezado=(
            <thead>
                <tr>
                    <th>Cédula del solicitante</th>
                    <th>Fecha de retiro</th>
                    <th>Estatus</th>
                </tr>
            </thead>
        )

        const jsx_tabla_body=(
            <tbody>
                {this.state.registros.map((retiro,index)=>{
                  let estado
                  if(retiro.estado_retiro === "E") estado = "En Espera";
                  if(retiro.estado_retiro === "R") estado = "Rechazado";
                  if(retiro.estado_retiro === "A")  estado = "Aprobado";
                  return(
                    <tr key={index}>
                      <td>{retiro.cedula_representante_solicitud}</td>
                      <td>{Moment(retiro.fecha_retiro).format("DD-MM-YYYY")}</td>
                      <td>{estado}</td>
                      <td>
                        <ButtonIcon
                          clasesBoton="btn btn-warning btn-block"
                          value={retiro.id_retiro}
                          id={retiro.id_retiro}
                          eventoPadre={this.irAlFormularioDeActualizacion}
                          icon="icon-pencil"
                        />
                      </td>
                        <td>
                            <button id={retiro.id_retiro} className='btn btn-danger btn-block' onClick={this.generarPdfRetiro}>
                                PDF
                            </button>
                        </td>
                    </tr>
                  )
                })}
            </tbody>
        )
        const jsx=(
            <div>
                <div class="modal fade" id="modalPdf" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-lg" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="exampleModalLabel">Reporte pdf</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <div id="filaVerPdf" className="row justify-content-center ocultarFormulario">
                                        <div className="col-auto">
                                            <a className="btn btn-success" id="linkPdf" target="_blank" href="#">Ver pdf</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer ">
                                    <button type="button" id="botonGenerarPdf" class="btn btn-success ocultarFormulario" onClick={this.generarPdf}>Generar pdf</button>
                                </div>
                            </div>
                        </div>
                  </div>
                {this.state.alerta.estado===true &&
                    (<div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12">

                        <AlertBootstrap colorAlert={this.state.alerta.color} mensaje={this.state.alerta.mensaje}/>

                    </div>)
                }
                <TituloModulo clasesRow="row mb-5" clasesColumna="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center" tituloModulo="Módulo Retiro"/>

                <div className="row">
                    <div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12 contenedor_tabla_aula">
                      <div className="row">
                        <ComponentFormSelect
                          clasesColumna="col-3 col-ms-3 col-md-3 col-lg-3 col-xl-3"
                          obligatorio="si"
                          mensaje={""}
                          nombreCampoSelect="Estatus:"
                          clasesSelect="custom-select"
                          name="estado_retiros"
                          id="estado_retiros"
                          eventoPadre={this.cambiarEstado}
                          defaultValue={this.state.estado_retiros}
                          option={this.state.estados}
                        />
                        <ComponentFormDate clasesColumna="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3"
                          obligatorio="si" mensaje={""} nombreCampoDate="Fecha desde:"
                          clasesCampo="form-control" value={this.state.fecha_desde} name="fecha_desde"
                          id="fecha_desde" eventoPadre={this.cambiarEstado} minio={this.state.fecha_minima} maxim={this.state.fecha_maxima}
                        />
                        <ComponentFormDate clasesColumna="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3"
                          obligatorio="si" mensaje={""} nombreCampoDate="Fecha Hasta:"
                          clasesCampo="form-control" value={this.state.fecha_hasta} name="fecha_hasta"
                          id="fecha_hasta" eventoPadre={this.cambiarEstado} minio={this.state.fecha_minima} maxim={this.state.fecha_maxima}
                        />
                    </div>
                        <Tabla tabla_encabezado={jsx_tabla_encabezado} tabla_body={jsx_tabla_body} numeros_registros={this.state.registros.length}/>
                    </div>
                </div>
            </div>
        )
        return (
          <div className="component_profesor">
            <ComponentDashboard
              componente={jsx}
              modulo={this.state.modulo}
              eventoPadreMenu={this.mostrarModulo}
              estado_menu={this.state.estado_menu}
            />
          </div>
        )
    }

}

export default withRouter(ComponentRetiro)
