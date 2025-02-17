import React from 'react';
import {withRouter} from 'react-router-dom'
//css
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-grid.css'
import '../css/componentAsignacionAulaProfesor.css'
//JS
import axios from 'axios'
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


const axiosCustom=axios.create({
    baseURL:`http://${servidor.ipServidor}:${servidor.servidorNode.puerto}/`
})

class ComponentAsignacionAulaProfesor extends React.Component{


    constructor(){
        super();
        this.mostrarModulo=this.mostrarModulo.bind(this)
        this.consultarAsignacionesPorAnoEscolar=this.consultarAsignacionesPorAnoEscolar.bind(this)
        this.irAlFormularioDeActualizacion=this.irAlFormularioDeActualizacion.bind(this)
        this.irAlFormularioDeRegistro=this.irAlFormularioDeRegistro.bind(this)
        // this.cambiarEstado=this.cambiarEstado.bind(this)
        this.state={
            modulo:"",
            estado_menu:false,
            //------------------ 
            listaAnoEscolares:[],
            registros:[],
            alerta:{
                color:null,
                mensaje:null,
                estado:false
            }
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
        let acessoModulo=await this.validarAccesoDelModulo("/dashboard/transaccion","/asignacion-aula-profesor")
        if(acessoModulo){
            await this.consultarAnoEscolares()
            this.consultarTodos()
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

    async consultarAnoEscolares(){
        await axiosCustom.get(`configuracion/ano-escolar/consultar-todos`)
        .then(respuesta => {
            let repuestaServidor=JSON.parse(JSON.stringify(respuesta.data))
            // console.log(repuestaServidor)
            this.setState({listaAnoEscolares:repuestaServidor.datos})
        })
        .catch(error => {
            console.error("error =>>> ",error)
        })
    }

    async consultarAsignacionesPorAnoEscolar(){
        let idAnoEscolar=document.getElementById("selectAnoEscolar")
        if(idAnoEscolar.value!=="null"){
            await axiosCustom.get(`transaccion/asignacion-aula-profesor/consultar-por-ano-escolar/${idAnoEscolar.value}`)
            .then(respuesta => {
                let repuestaServidor=JSON.parse(JSON.stringify(respuesta.data))
                console.log(repuestaServidor)
                this.setState({registros:repuestaServidor.datos})
            })
            .catch(error => {
                console.error("error =>>> ",error)
            })
        }
        else{
            await this.consultarTodos()
        }
    }

    async consultarTodos(){
        await axiosCustom.get(`transaccion/asignacion-aula-profesor/consultar-todos`)
        .then(respuesta => {
            let repuestaServidor=JSON.parse(JSON.stringify(respuesta.data))
            console.log(repuestaServidor)
            this.setState({registros:repuestaServidor.datos})
        })
        .catch(error => {
            console.error("error =>>> ",error)
        })
    }

    irAlFormularioDeActualizacion(a){
        let input=a.target
        this.props.history.push(`/dashboard/transaccion/asignacion-aula-profesor/actualizar/${input.id}`)
    }
    
    irAlFormularioDeRegistro(a){
        let input=a.target
        this.props.history.push(`/dashboard/transaccion/asignacion-aula-profesor/registrar`)
    }

    render(){

        const jsx_tabla_encabezado=(
            <thead> 
                <tr> 
                    <th>Código</th> 
                    <th>Nombre del Profesor</th>
                    <th>Grado</th>
                    <th>Aula</th>
                    <th>Año Escolar</th>
                    <th>Estado</th>
                </tr> 
            </thead>
        )

        const jsx_tabla_body=(
            <tbody>
                {this.state.registros.map((asignacion,index)=>{
                    return(
                        <tr key={index}>
                            <td>{asignacion.id_asignacion_aula_profesor}</td>
                            <td>{asignacion.nombres} {asignacion.apellidos}</td>
                            <td>{asignacion.numero_grado}</td>
                            <td>{asignacion.nombre_aula}</td>
                            <td>{asignacion.ano_desde} - {asignacion.ano_hasta}</td>
                            <td>{(asignacion.estatus_asignacion_aula_profesor==="1")?"Activo":"Inactivo"}</td>
                            {!asignacion.vacio &&
                                <td>
                                    <ButtonIcon 
                                    clasesBoton="btn btn-warning btn-block" 
                                    value={asignacion.id_asignacion_aula_profesor} 
                                    id={asignacion.id_asignacion_aula_profesor}
                                    eventoPadre={this.irAlFormularioDeActualizacion} 
                                    icon="icon-pencil"
                                    />
                                </td>
                            }
                    </tr>
                    )
                })}
            </tbody>
        )

        const jsx=(
            <div>
                {this.state.alerta.estado===true &&
                    (<div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12">

                        <AlertBootstrap colorAlert={this.state.alerta.color} mensaje={this.state.alerta.mensaje}/>
                        
                    </div>)
                }
                <TituloModulo clasesRow="row mb-5" clasesColumna="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center" tituloModulo="Módulo de Aula"/>

                <div className="row">
                    <div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12 contenedor_tabla_aula">
                        <div className="row">
                            <div className="col-3 col-ms-3 col-md-3 col-lg-3 col-xl-3 mb-3">
                                <div class="form-groud">
                                        <label>Año Escolar</label>
                                        <select class="form-select custom-select" id="selectAnoEscolar" name="selectAnoEscolar" aria-label="Default select example" onChange={this.consultarAsignacionesPorAnoEscolar}>
                                            <option value="null" >Seleccione un Año Escolar</option>
                                            {this.state.listaAnoEscolares.map((anoEscolar,index) => {
                                                return <option key={index} value={anoEscolar.id_ano_escolar} >{anoEscolar.ano_desde} - {anoEscolar.ano_hasta}</option>
                                            })}
                                        </select>
                                  </div>
                            </div>
                        </div>
                        <Tabla tabla_encabezado={jsx_tabla_encabezado} tabla_body={jsx_tabla_body} numeros_registros={this.state.registros.length}/>
                    </div>
                </div>

                <div className="row">
                
                  <div className="col-3 col-ms-3 col-md-3 columna-boton">
                      <div className="row justify-content-center align-items-center contenedor-boton">
                        <div className="col-auto">
                          <InputButton clasesBoton="btn btn-primary" eventoPadre={this.irAlFormularioDeRegistro} value="Registrar"/>
                        </div>
                      </div>
                    </div>
                </div>

            </div>
        )
        return (
            <div className="component_asig_aula_profesor">

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

export default withRouter(ComponentAsignacionAulaProfesor)