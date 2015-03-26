function home(){startParse(),goTo("pages/autenticacao.html",function(){localStorage.removeItem("participante")})}function admin(){goTo("pages/authadmin.html",function(){setTitle("Bem vindo ao vote-fácil","Informe suas credenciais para autenticar no sistema")})}function homeAdmin(){goTo("pages/opcadm.html",function(){$(function(){$(".list-group-item").hover(function(){$(this).stop(!0,!0).addClass("active",500)},function(){$(this).stop(!0,!0).removeClass("active",100)})}),setTitle("Vote-Fácil","")})}function autenticar(){var e=document.getElementById("iusername").value,t=document.getElementById("ipassword").value;Parse.User.logIn(e,t,{success:function(e){e.get("isAdmin")?homeAdmin():alert("Não é admin")},error:function(){}})}function logoff(){startParse(),Parse.User.logOut(),admin()}function isLogado(){var e=Parse.User.current();e?homeAdmin():admin()}function iniciarVotacao(){var e=document.getElementById("iusername").value,t=new Parse.Query(Parse.Object.extend("Participante"));t.equalTo("matricula",e),t.find({success:function(t){t.length>0?(localStorage.setItem("participante",t[0].id),goTo("pages/votar.html",function(){var t=new Parse.Query(Parse.Object.extend("Pesquisa"));t.equalTo("ativa",!0),t.find({success:function(t){var a,n=document.getElementById("pergunta"),i="";if(t.length>0){var s=new Parse.Query(Parse.Object.extend("Participante"));s.equalTo("matricula",e),$(t).each(function(e,t){var o=t,r=!1;s.find({success:function(e){$(e).each(function(e,s){var c=s.relation("votos");c.query().find({success:function(e){$(e).each(function(e,t){r||t.get("parent").id!=o.id||(r=!0)}),r?(n.innerHTML="<h1>Voto já computado</h1>",$(".btn-success").addClass("disabled")):(a=new Parse.Query(Parse.Object.extend("Opcao")),a.equalTo("parent",t),a.ascending("numero"),a.find({success:function(e){i+="<div class='container-fluid'>",i+="<h1>"+t.get("titulo")+"</h1>",i+="<h3>"+t.get("pergunta")+"</h3>",i+="<div class='row-same-height'>",$(e).each(function(e,t){i+="<div class='col-sm-6 col-md-4 col-full-height' data-value='"+t.id+"' onclick='focusControl(this)'>",i+="<div class='thumbnail'>",t.get("arquivo")&&(i+="<img src='"+t.get("arquivo").url()+"' class='img-rounded' /></br>"),t.get("textoOpcao")&&(i+="<div class='caption'>",i+="<h3>"+t.get("textoOpcao")+"</h3>",i+="</div>"),i+="</div>",i+="</div>"}),i+="</div>",i+="</div>",n.innerHTML=i}}))}})})}})})}else n.innerHTML="<h1>Nenhuma pesquisa disponível no momento</h1>",$(".btn-success").addClass("disabled")}})})):alert("Matricula não cadastrada")}})}function focusControl(e){$("button.btn-primary").removeClass("btn-primary"),$(e).addClass("btn-primary"),confirm("Confirma seu voto?")&&registrarVoto()}function registrarVoto(){var e=$(".btn-primary")[0];if(e){var t=e.dataset.value,a=new Parse.Query(Parse.Object.extend("Opcao"));a.get(t,{success:function(e){var t=obterParticipanteAtivo(),a=new Parse.Query(Parse.Object.extend("Participante"));a.get(t,{success:function(t){var a=t.relation("votos");a.add(e),t.save().then(function(){alert("Voto computado"),home()})}})}})}else alert("Você deve selecionar uma opção")}function obterParticipanteAtivo(){return localStorage.getItem("participante")}function goCadastrarPesquisa(e,t){if(e){var a=new Parse.Query(Parse.Object.extend("Opcao"));a.equalTo("parent",e),a.ascending("numero"),a.find({success:function(a){__opcoes=a,goTo("pages/cadpesquisa.html",function(){document.getElementById("ipergunta").value=e.get("pergunta"),document.getElementById("ititulo").value=e.get("titulo"),document.getElementById("objectId").value=e.id,listarOpcoes(),t&&($(".btn").addClass("disabled"),$(".btn-danger").removeClass("disabled"),$("input.form-control").attr("disabled","disabled"))})}})}else __opcoes=new Array,goTo("pages/cadpesquisa.html")}function goVisualizarPesquisas(){goTo("pages/viewpesquisas.html",function(){setTitle("Todas as Pesquisas","Você pode visualizar todas as pesquisas, ordenadas pela data de criação"),startParse();var e=new Parse.Query(Parse.Object.extend("Pesquisa"));e.find({success:function(e){listarPesquisas(e)}})})}function goCadastrarParticipante(e){goTo("pages/cadparticipante.html",function(){setTitle("Cadastrar Participante","Informe a matrícula e o nome do participante"),e&&(document.getElementById("participanteId").value=e.id,document.getElementById("inome").value=e.get("nome"),document.getElementById("imatricula").value=e.get("matricula"))})}function goListarParticipantes(){goTo("pages/listarparticipantes.html",function(){setTitle("Participantes","Veja abaixo a lista de todos os participantes");var e=document.getElementById("listaParticipantes"),t=new Parse.Query(Parse.Object.extend("Participante"));t.find({success:function(t){var a="<table class='table table-striped'>";a+="<thead><td>Matricula</td><td>Nome</td><td></td></thead>",$(t).each(function(e,t){a+="<tr><td>"+t.get("matricula")+"</td><td>"+t.get("nome")+"</td><td><button class='btn btn-default fa fa-edit' data-id='"+t.id+"' data-toggle='tooltip' title='Alterar Participante' onclick='alterarParticipante(this.dataset.id)'></button><button class='btn btn-default fa fa-trash' data-id='"+t.id+"' data-toggle='tooltip' title='Excluir Participante' onclick='excluirParticipante(this.dataset.id)'></button></td></tr>"}),a+="</table>",e.innerHTML=a}})})}function excluirParticipante(e){if(confirm("Confirma e Exclusão?")){var t=new Parse.Query(Parse.Object.extend("Participante"));t.get(e).then(function(e){e.destroy().then(goListarParticipantes)})}}function alterarParticipante(e){var t=new Parse.Query(Parse.Object.extend("Participante"));t.get(e).then(goCadastrarParticipante)}function goGerarRelatorioPercentualVotacao(){new Map;goTo("pages/relatorioQuantitativoVotacao.html",function(){setTitle("Resultado da Votação","");var e=new Parse.Query(Parse.Object.extend("Pesquisa"));e.equalTo("ativa",!0);var t=new Parse.Query(Parse.Object.extend("Opcao"));t.matchesQuery("parent",e),t.include("parent"),t.find({success:function(a){var n=document.getElementById("content"),i="",s=a[0].get("parent");i+="<div>",i+="   <h1>"+s.get("titulo")+"</h1>",i+="   <h3>"+s.get("pergunta")+"</h3>",i+="   <small>Total de votos&nbsp;<strong id='"+s.id+"'>0</strong></small>",i+="</div>",$(a).each(function(e,t){i+="<div class='well well-sm'>",t.get("arquivo")&&(i+="<img src='"+t.get("arquivo").url()+"' class='img-rounded' /></br>"),t.get("textoOpcao")&&(i+="<h3>"+t.get("textoOpcao")+"</h3>"),i+="<center><h3 id='"+t.id+"' class='item-percentual' data-votos='0'>0</h3></center>",i+="</div>"}),n.innerHTML=i;var o=new Parse.Query(Parse.Object.extend("Participante"));o.matchesQuery("votos",t),o.find().then(function(t){var a=document.getElementById(s.id);$(t).each(function(t,n){var i=n.relation("votos").query();i.matchesQuery("parent",e),i.find().then(function(e){$(e).each(function(e,t){var n=parseInt(a.innerHTML);n++,a.innerHTML=n;var i=document.getElementById(t.id),s=parseInt(i.dataset.votos);s++,i.dataset.votos=s,processarTotais(n)})})})})}})})}function processarTotais(e){$(".item-percentual").each(function(t,a){var n=parseInt(a.dataset.votos),i=100*n/e;a.innerHTML=i.toFixed(2)+" %"})}function viewOpcao(e){$(".hide-on-new").hide("slow");var t,a=document.getElementById("newopc"),n="";e&&(n=e.get("textoOpcao"),t=e.get("arquivo")?e.get("arquivo").url():void 0);var i=__opcoes.indexOf(e);a.innerHTML=newOpc.replace("@OPC_TEXT",n).replace("@OPC_IMG",t?"<img src='"+t+"/>":"").replace("@UPDATE_INDEX",i>-1?i:void 0)}function salvarOpcao(e){var t=document.getElementById("itextoOpcao").value,a=$("#iarquivo")[0];if(a.files.length>0)var n=a.files[0],i=randonName(),s=new Parse.File(i,n);var o=Parse.Object.extend("Opcao"),r=new o;""!==t&&r.set("textoOpcao",t),s&&r.set("arquivo",s),void 0!==e?(__opcoes[e]=r,r.set("numero",e)):(__opcoes.push(r),r.set("numero",__opcoes.length)),listarOpcoes()}function alterarOpcao(e){viewOpcao(__opcoes[e])}function excluirOpcao(e){__opcoes.splice(e,1),listarOpcoes()}function listarOpcoes(){document.getElementById("newopc").innerHTML="";var e="";$(__opcoes).each(function(t,a){e+=printOpc.replace("@OPC_IMAGE",a.get("arquivo")?"<img src='"+a.get("arquivo").url()+"' alt='A imagem será carregada assim que a pesquisa for salva.":"").replace("@OPC_TEXT",a.get("textoOpcao")?a.get("textoOpcao"):"").replace("@OPC_COD",__opcoes.indexOf(a)).replace("@OPC_COD",__opcoes.indexOf(a))}),document.getElementById("opcoes").innerHTML=e,$(".hide-on-new").show("slow")}function salvarPesquisa(){if(!__opcoes||__opcoes.length<2)return void alert("A pesquisa deve ter ao menos duas opções");var e=document.getElementById("ititulo").value,t=document.getElementById("ipergunta").value;if(""===e.trim()||""===t.trim())alert("Você deve informar todos os campos da pesquisa.");else{var a=document.getElementById("objectId").value;Pesquisa=Parse.Object.extend("Pesquisa"),pesquisa=new Pesquisa,pesquisa.set("titulo",e),pesquisa.set("pergunta",t),pesquisa.set("ativa",!1),a&&pesquisa.set("objectId",a);var n=pesquisa.relation("opcoes");$(__opcoes).each(function(e,t){t.set("parent",pesquisa),t.save().then(function(){n.add(t)})}),pesquisa.save().then(homeAdmin)}}function listarPesquisas(e){var t,a="",n="",i="<div class='container-fluid'><h3>@TITULO </h3><small>@PERGUNTA</small><div class='container-inline'>@OPC</div></div>",s="<button data-toggle='tooltip' title='Visualizar Pesquisa' class='btn' data-id='@COD_PESQUISA' onclick='verPesquisa(this)'> <span class='fa fa-info'></span></button>",o="<button data-toggle='tooltip' title='Alterar Pesquisa' class='btn' data-id='@COD_PESQUISA' onclick='alterarPesquisa(this)'> <span class='fa fa-edit'></span></button>",r="<button data-toggle='tooltip' title='Ativar Pesquisa' class='btn btn-primary' data-id='@COD_PESQUISA' onclick='ativarPesquisa(this)'> <span class='fa fa-bell'> </span></button>",c="<button data-toggle='tooltip' title='Desativar Pesquisa' class='btn btn-danger' data-id='@COD_PESQUISA' onclick='desativarPesquisa(this)'> <span class='fa fa-bell-slash'></span></button>";$(e).each(function(e,u){u.get("ativa")?(t=s.replace("@COD_PESQUISA",u.id)+"&nbsp;"+c.replace("@COD_PESQUISA",u.id),a+=i.replace("@TITULO",u.get("titulo")).replace("@PERGUNTA",u.get("pergunta")).replace("@OPC",t)):(t=s.replace("@COD_PESQUISA",u.id)+"&nbsp;"+o.replace("@COD_PESQUISA",u.id)+"&nbsp;"+r.replace("@COD_PESQUISA",u.id),n+=i.replace("@TITULO",u.get("titulo")).replace("@PERGUNTA",u.get("pergunta")).replace("@OPC",t))}),$(".pesquisa-ativa").html(""!==a?a:"Nenhuma pesquisa ativa no momento."),$(".pesquisas").html(""!==n?n:"Nenhuma pesquisa encontrada.")}function verPesquisa(e){query=new Parse.Query(Parse.Object.extend("Pesquisa")),query.equalTo("objectId",e.dataset.id),query.find({success:function(e){var t=e[0];goCadastrarPesquisa(t,!0)},error:function(){console.log("error")}})}function alterarPesquisa(e){query=new Parse.Query(Parse.Object.extend("Pesquisa")),query.equalTo("objectId",e.dataset.id),query.find({success:function(e){var t=e[0];goCadastrarPesquisa(t)},error:function(){console.log("error")}})}function ativarPesquisa(e){var t=new Parse.Query(Parse.Object.extend("Pesquisa"));t.equalTo("ativa",!0),t.find({success:function(e){$(e).each(function(e,t){t.set("ativa",!1),t.save()})}}),t=new Parse.Query(Parse.Object.extend("Pesquisa")),t.equalTo("objectId",e.dataset.id),t.find({success:function(e){var t=e[0];t.set("ativa",!0),t.save(null,{success:function(){goVisualizarPesquisas()}})},error:function(){console.log("error")}})}function desativarPesquisa(e){query=new Parse.Query(Parse.Object.extend("Pesquisa")),query.equalTo("objectId",e.dataset.id),query.find({success:function(e){var t=e[0];t.set("ativa",!1),t.save(null,{success:function(){goVisualizarPesquisas()}})},error:function(){console.log("error")}})}function salvarParticipante(){var e=document.getElementById("imatricula").value,t=document.getElementById("inome").value,a=document.getElementById("participanteId").value,n=Parse.Object.extend("Participante"),i=new n;a&&i.set("objectId",a),i.set("matricula",e),i.set("nome",t),i.set("ativo",!0),i.save().then(function(){return""!==a.trim()?void goListarParticipantes():void goCadastrarParticipante()})}function randonName(){return"imagem"}function goTo(e,t){var a=$(".loading");a.show();var n=new XMLHttpRequest;n.onreadystatechange=function(){if(4===this.readyState&&200===this.status){content.innerHTML=this.responseText;var e;return t&&(e=t()),Parse.User.current()?$(".logoff").fadeIn():$(".logoff").fadeOut(),$("[data-toggle='tooltip']").tooltip(),a.hide(),e}},n.open("GET",e,!0),n.send()}function setTitle(e,t){$(".page-title").html(e),t&&$(".page-subtitle").html(t)}function startParse(){Parse.initialize("AMWPVkiXCTh491UdP5PU5qP4qbRkuFnr3wQYwkq2", "wpz9034zJoF6avWKTvRk6jSqTN2PHoZC3LIrF8Rt")}var content=document.getElementById("content"),printOpc="<div class='row'><div class='col-sm-6 col-md-4'><div class='thumbnail'>@OPC_IMAGE<div class='caption'><h3>@OPC_TEXT</h3><p><a onclick='alterarOpcao(@OPC_COD)' class='btn btn-primary' role='button'>Alterar</a> <a onclick='excluirOpcao(@OPC_COD)' class='btn btn-default' role='button'>Excluir</a></p></div></div></div></div>",newOpc="<div class='row'><div><div class='thumbnail'><h3> Digite um texto para a opção </h3><div class='input-group'><span class='input-group-addon' id='textoOpcao'><span class='fa fa-check-circle'></span></span><input id='itextoOpcao' type='text' value='@OPC_TEXT' class='form-control' placeholder='Digite um texto para a opção (opcional)' aria-describedby='textoOpcao'></div><div class='caption'><h3> Inclua uma imagem </h3><div class='input-group'><span class='input-group-addon' id='arquivo'><span class='fa fa-picture-o'></span></span>@OPC_IMG<input type='file' id='iarquivo'  /></div><br><p><button onclick='salvarOpcao(@UPDATE_INDEX)' class='btn btn-block btn-primary'>Salvar</button><button onclick='listarOpcoes()' class='btn btn-block btn-danger'>Cancelar</button></p></div></div></div></div>",pesquisa,__opcoes=new Array;