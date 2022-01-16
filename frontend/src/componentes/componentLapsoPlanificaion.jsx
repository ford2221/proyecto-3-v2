import React from 'react';
import {withRouter} from 'react-router-dom'
//css
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-grid.css'
import '../css/componentLapsoPlanificaion.css'
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

class ComponentLapsoPlanificaion extends React.Component{

    constructor(){
        super();
        this.mostrarModulo=this.mostrarModulo.bind(this);
        this.regresarHaPlanificaiones=this.regresarHaPlanificaiones.bind(this);
        this.irHaLapso=this.irHaLapso.bind(this);
        this.state={
            modulo:"",
            estado_menu:false,
            // ------
            listaDeLapsos:[],
            //
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
        const {id_planificacion} =this.props.match.params
        await this.consultarLapsoPlanificacion(id_planificacion)
    }

    async consultarLapsoPlanificacion(idPlanificacion){
        await axiosCustom.get(
            `transaccion/planificacion-lapso-escolar/consultar-lapso/${idPlanificacion}`
        )
        .then(respuesta=>{
            console.log(respuesta)
            let json=JSON.parse(JSON.stringify(respuesta.data))
            console.log("->>>>>>>>>>",json)
            this.setState({listaDeLapsos:json.datos})
        })
        .catch(error => {
            let alerta=JSON.parse(JSON.stringify(this.state.alerta))
            alerta.color="danger"
            alerta.mensaje="error al conectarse con el servidor"
            alerta.estado=true
            this.setState({alerta})
        })
    }

    regresarHaPlanificaiones(){
        this.props.history.push(`/dashboard/transaccion/planificacion`)
    }

    irHaLapso(a){
        let input=a.target
        const {id_planificacion} =this.props.match.params
        const id_lapso=input.getAttribute("data-id-lapso")
        this.props.history.push(`/dashboard/transaccion/planificacion/${id_planificacion}/lapso/${id_lapso}`)
    }

    render(){
        const jsx=(
            <div>
                 {this.state.alerta.estado===true &&
                    (<div className="col-12 col-ms-12 col-md-12 col-lg-12 col-xl-12">

                        <AlertBootstrap colorAlert={this.state.alerta.color} mensaje={this.state.alerta.mensaje}/>
                        
                    </div>)
                }
                <button className='btn btn-primary' onClick={this.regresarHaPlanificaiones}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                </button>
                <h2 className='titulo-modulo-lapso-planificaion'>lapsos Academico</h2>
                {this.state.listaDeLapsos.map((lapso,index) => {
                    return (
                        <div className="contenedor-lapso" key={index} data-id-lapso={lapso.id_lapso_academico} onClick={this.irHaLapso}>
                            <div className='lapso' data-id-lapso={lapso.id_lapso_academico}>
                                <div class="nombre-lapso" data-id-lapso={lapso.id_lapso_academico}>Lapso {lapso.nombre_lapso_academico}</div>
                                <div class="estado-lapso" data-id-lapso={lapso.id_lapso_academico}> {(lapso.estatu_lapso_academico==="1")?"No Esta Listo":"Esta Listo"}</div>
                            </div>
                        </div>
                    )
                })}
                
            </div>
        )
        return(
            <div className="component_lapso_planificaion">
                    
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

export default withRouter(ComponentLapsoPlanificaion);