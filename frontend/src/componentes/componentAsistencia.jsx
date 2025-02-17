import React from 'react';
import {withRouter} from 'react-router-dom'
import axios from 'axios'
// IP servidor
import servidor from '../ipServer.js'
//css
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-grid.css'
import '../css/componentAsistencia.css'
//componentes
import ComponentDashboard from './componentDashboard'

class ComponentAsistencia extends React.Component {


    constructor(){
        super();
        this.mostrarModulo=this.mostrarModulo.bind(this);
        this.validarCampoCedula=this.validarCampoCedula.bind(this);
        this.enviarDatos=this.enviarDatos.bind(this);
        this.state={
            cedula:"",
            // --------
            modulo:"",
            estado_menu:false,
            mensaje:{
              texto:"",
              estado:""
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

    async UNSAFE_componentWillMount(){
        // alert("hola")
        let acessoModulo=await this.validarAccesoDelModulo("/dashboard/transaccion","/asistencia")
        if(!acessoModulo){
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

    componentDidMount(){
        let jsonCedula={
            target:{
                value:this.state.cedula
            }
        }
        this.validarCampoCedula(jsonCedula)
    }

    cambiarEstado($inputJsx){
        let $input=$inputJsx.target;
        this.setState({[$input.name]:$input.value});
    }

    validarCampoCedula($inputJsx){
        let $boton=document.getElementById("botonEnviarDatos");
        let $input=$inputJsx.target;
        const expresion=/[a-zA-Z]/g;
        if(!expresion.test($input.value)){
            this.cambiarEstado($inputJsx);
            $boton.disabled=false;
        }
        else{
            this.cambiarEstado($inputJsx);
            $boton.disabled=true;
        }

    }

    enviarDatos(){
        let mensaje={};
        const token=localStorage.getItem('usuario')
        let json={
            asistencia:{
                cedula:this.state.cedula
            },
            token
        }
        // console.log(json);
        axios.post(`http://${servidor.ipServidor}:${servidor.servidorNode.puerto}/transaccion/asistencia/presente`,json)
        .then(respuesta => {

            console.log(respuesta)
           if(respuesta.data.respuesta_api){
                mensaje.texto=respuesta.data.respuesta_api.mensaje;
                mensaje.estado=respuesta.data.respuesta_api.estado_peticion;
           }
           else{
            mensaje.texto=respuesta.data.mensaje;
            mensaje.estado=respuesta.data.estado_peticion;
           }
            this.setState({mensaje})
        })
        .catch(error => {
            mensaje.texto="Conexion defisiente"
            mensaje.estado="500"
            this.setState({mensaje})
            console.log(error)
        })

    }

    render(){
        let jsx=(
            <div className="contenedor_from">
                <div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12">
                    {this.state.mensaje.texto!=="" && (this.state.mensaje.estado==="200" || this.state.mensaje.estado==="404" || this.state.mensaje.estado==="500")  &&
                        <div className="row">
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <div className={`alert alert-${(this.state.mensaje.estado==="200")?"success":"danger"} alert-dismissible`}>
                                    <p>Mensaje: {this.state.mensaje.texto}</p>
                                    
                                    <button className="close" data-dismiss="alert">
                                        <span>X</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                </div>

                <h1 className="titulo_h1">Asistencia</h1>

                <form id="formularioHorario" className="formularioHorario ">

                    <div className="row justify-content-center ">
                        <div className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3 asistencia_cedula">
                            <div>Cédula</div>
                            <input type="text"  className="form-control" id="cedula" name="cedula" value={this.state.cedula} onChange={this.validarCampoCedula} placeholder="Ingrese su Cédula"/>
                        </div>
                    </div>
                
            
            
                </form>

                <div className="contenedor_boton_guardar_horario mt-5">

                    <button id="botonEnviarDatos" onClick={this.enviarDatos} className="btn btn-primary btn-block" >Enviar</button>
                
                </div>
            
            </div>
        );
        return(

            <div className="contenedor_asistencia">
            

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

export default withRouter(ComponentAsistencia);