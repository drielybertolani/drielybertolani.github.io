var content = document.getElementById("content");

var printOpc = "<div class='row'>"+
          "<div class='col-sm-6 col-md-4'>"+
            "<div class='thumbnail'>"+
              "@OPC_IMAGE"+
              "<div class='caption'>"+
                "<h3>@OPC_TEXT</h3>"+
                "<p><a onclick='alterarOpcao(@OPC_COD)' class='btn btn-primary' role='button'>Alterar</a> <a onclick='excluirOpcao(@OPC_COD)' class='btn btn-default' role='button'>Excluir</a></p>"+
              "</div>"+
            "</div>"+
          "</div>"+
        "</div>";

var newOpc = "<div class='row'>"+
             "<div>"+ 
               "<div class='thumbnail'>"+
               "<h3> Digite um texto para a opção </h3>"+
               "<div class='input-group'>"+
               "<span class='input-group-addon' id='textoOpcao'><span class='fa fa-check-circle'></span></span>"+
               "<input id='itextoOpcao' type='text' value='@OPC_TEXT' class='form-control' placeholder='Digite um texto para a opção (opcional)' aria-describedby='textoOpcao'>"+
               '</div>'+
                 "<div class='caption'>"+
                   "<h3> Inclua uma imagem </h3>"+
                    "<div class='input-group'>"+
                    "<span class='input-group-addon' id='arquivo'><span class='fa fa-picture-o'></span></span>"+
                    "@OPC_IMG"+
                    "<input type='file' id='iarquivo'  />"+     
                    "</div>"+
                    "<br>"+
                    "<p>"+
                        "<button onclick='salvarOpcao(@UPDATE_INDEX)' class='btn btn-block btn-primary'>Salvar</button>"+
                        "<button onclick='listarOpcoes()' class='btn btn-block btn-danger'>Cancelar</button>"+
                    "</p>"+
                 "</div>"+
               "</div>"+
             "</div>"+
             "</div>";

var pesquisa;
var __opcoes = new Array();

function home() {
    startParse();
    goTo("pages/autenticacao.html", function() {
        localStorage.removeItem("participante");
    });
}

function admin() {
    goTo("pages/authadmin.html", function () {
        setTitle("Bem vindo ao vote-fácil", "Informe suas credenciais para autenticar no sistema")
    });
}

function homeAdmin() {
    goTo("pages/opcadm.html", function() {
        $(function() {
            $(".list-group-item").hover(function() {
                $(this).stop(true,true).addClass("active", 500);
            }, function() {
                $(this).stop(true,true).removeClass("active", 100);
            });
            
        })
        setTitle("Vote-Fácil", "");
    });
}

function autenticar() {
    var username = document.getElementById("iusername").value;
    var password = document.getElementById("ipassword").value;

    Parse.User.logIn(username, password, {
        success : function(user) {
            if (user.get("isAdmin")) {
                homeAdmin();
            } else {
                alert("Não é admin");
            }
        },

        error: function (user) {

        }
    })
}

function logoff() {
    startParse();
    Parse.User.logOut();
    admin();
}

function isLogado() {
    var currentUser = Parse.User.current();
    if (currentUser) {
        homeAdmin();
    } else {
       admin();
    }   
}

function iniciarVotacao() {
    var matricula = document.getElementById("iusername").value;
    var query = new Parse.Query(Parse.Object.extend("Participante"));
    
    query.equalTo("matricula", matricula);
    query.find({
        success : function (list) {
            if (list.length > 0) {
                localStorage.setItem("participante", list[0].id);
                goTo("pages/votar.html", function() {
                    var query = new Parse.Query(Parse.Object.extend("Pesquisa"));
                    query.equalTo("ativa", true);
                    query.find({
                        success : function(data) {
                            var pergunta = document.getElementById("pergunta");
                            var _ = "";
                            var queryOpcoes;

                            if (data.length > 0) {
                                var queryParticipante = new Parse.Query(Parse.Object.extend("Participante"));
                                queryParticipante.equalTo("matricula", matricula);

                                $(data).each(function(i, e) {
                                    var pesquisa = e; // apenas para ficar mais fácil de escrever... 
                                    var jahVotou = false;

                                    queryParticipante.find({
                                      success : function (participantes) {
                                        $(participantes).each(function(i, participante) {
                                          var votos = participante.relation("votos");
                                          votos.query().find({
                                            success : function (votosParticipante) {
                                                $(votosParticipante).each(function (i, voto){
                                                    if (!jahVotou && voto.get("parent").id == pesquisa.id) {
                                                        jahVotou = true;
                                                    }
                                                });

                                                if (!jahVotou) {
                                                    queryOpcoes = new Parse.Query(Parse.Object.extend("Opcao"));
                                                    queryOpcoes.equalTo("parent", e);
                                                    queryOpcoes.ascending("numero");
                                                    queryOpcoes.find({
                                                        success : function (opcoes) {
                                                            _ += "<div class='container'>";
                                                            _ += "<h1>"+e.get("titulo")+"</h1>";
                                                            _ += "<h3>"+e.get("pergunta")+"</h3>";
                                                            _ += "<div class='container-fluid'>";
                                                            $(opcoes).each(function(i, e) {
                                                                _ += "<div class='row box-votacao' onclick='focusControl(this)'>";
                                                                if (e.get("arquivo")) {
                                                                    _ += "<div class='pull-left col-md-2'>"
                                                                    _ += "<img src='"+e.get("arquivo").url()+"' class='img-rounded' />";
                                                                    _ += "</div>";
                                                                }

                                                                if (e.get("textoOpcao")) {
                                                                    _ += "<div class='col-md-10 descricao-opcao-voto center-block pagination-centered'><p class='large'>";
                                                                    _ += e.get("textoOpcao");
                                                                    _ += "</p></div>"
                                                                      
                                                                }
                                                                _ += "</div><br>";

                                                            });
                                                            _ += "</div>";
                                                            _ += "</div>";
                                                            pergunta.innerHTML = _;
                                                        }
                                                    })    
                                                } else {
                                                    pergunta.innerHTML = "<h1>Voto já computado</h1>";
                                                    $(".btn-success").addClass("disabled"); 
                                                } 
                                            }
                                          });
                                        })
                                      }
                                    });   
                                });
                            } else {
                                pergunta.innerHTML = "<h1>Nenhuma pesquisa disponível no momento</h1>";
                                $(".btn-success").addClass("disabled");
                            }
                        }
                    });
                });
            } else {
                alert("Matricula não cadastrada");
            }
        }
     });
}

function focusControl(element) {
    $("div.row.btn-primary").removeClass("btn-primary");
    $(element).addClass("btn-primary");
    if (confirm("Confirma seu voto?")) {
        $(".opcao").addClass("disabled");
        $(element).html("<center><span class='fa fa-refresh fa-spin'></span></center>");
        registrarVoto();
    }
}

function registrarVoto() {
    var selecionada = $(".btn-primary")[0];
    if (selecionada) {
        var opcaoid = selecionada.dataset.value;
        var getOpcao = new Parse.Query(Parse.Object.extend("Opcao"));
        getOpcao.get(opcaoid, {
            success : function (opcao) {
                var participanteId = obterParticipanteAtivo();
                var queryParticipante = new Parse.Query(Parse.Object.extend("Participante"));
                queryParticipante.get(participanteId , {
                    success : function (participante) {
                        var votos = participante.relation("votos");
                        votos.add(opcao);
                        participante.save().then(function (){
                            alert("Voto computado");
                            home();
                        });
                    }
                });
            }
        })
    } else {
        alert("Você deve selecionar uma opção");
    }

}

function obterParticipanteAtivo() {
    return localStorage.getItem("participante");
}

/*
  Menu Administrativo - Cadastro de Pesquisa
 */

 function goCadastrarPesquisa(pesquisa, readonly) {
    if (pesquisa) {
        var query = new Parse.Query(Parse.Object.extend("Opcao"));
        query.equalTo("parent", pesquisa);
        query.ascending("numero");
        query.find({
            success : function (opc) {
                __opcoes = opc;
                goTo("pages/cadpesquisa.html", function() {
                    document.getElementById("ipergunta").value = pesquisa.get("pergunta");
                    document.getElementById("ititulo").value = pesquisa.get("titulo");
                    document.getElementById("objectId").value = pesquisa.id;
                    listarOpcoes();                     

                    if (readonly) {
                        $(".btn").addClass("disabled");
                        $(".btn-danger").removeClass("disabled");
                        $("input.form-control").attr("disabled", "disabled");
                    }
                });     
            }
        });
    } else {
        __opcoes = new Array();
        goTo("pages/cadpesquisa.html");
    }
 }

 function goVisualizarPesquisas() {
    goTo("pages/viewpesquisas.html", function() { 
        setTitle("Todas as Pesquisas", "Você pode visualizar todas as pesquisas, ordenadas pela data de criação");
        
        startParse();
        var query = new Parse.Query(Parse.Object.extend("Pesquisa"));
        query.find({
          success : function (data) { 
            listarPesquisas(data);  
          }
        });
    });
 }
 
 function goCadastrarParticipante(participante) {
    goTo("pages/cadparticipante.html", function(){
        setTitle("Cadastrar Participante", "Informe a matrícula e o nome do participante");
        if (participante) {
           document.getElementById('participanteId').value = participante.id;
           document.getElementById('inome').value = participante.get("nome");
           document.getElementById('imatricula').value = participante.get('matricula');
        }
    }); 
 }

 function goImportarParticipante() {
    goTo("pages/importacaoCSVParticipantes.html", function(){
        setTitle("Importar Participantes");
        $(".loading").hide();
    });
 }
 
 function prepararArquivo() {
    var arquivo = $("#csv-file")[0];
    if (arquivo.files.length > 0) {
      $(".loading").fadeIn();
      var file = arquivo.files[0];
      processarCSV(file);
      $(".loading").fadeOut();
    }
 }

 function processarCSV(csv) {
    var resultado = document.getElementById("resultado");
    resultado.innerHTML += "<table class='table table-hover table-condensed'><thead><td>Matricula</td><td>Nome</td><td></td></thead></table>";

    Papa.parse(csv, {
        worker: true,
        complete : function (results, file) {
            setTitle("Importar Participantes", "Leitura do arquivo concluída. O processamento será executado em 2º plano e você pode acompanhar o log de execução.");
        },
        skipEmptyLines: true,
        step: function(results) {           
            var table = $(".table")[0];
            var matricula = results.data[0][0];
            var nome = results.data[0][1];
            
            if (!matricula || !nome) 
                return;
            
            var Participante = Parse.Object.extend("Participante");
            var participante = new Participante();

            var buscarParticipante = new Parse.Query(Participante);
            buscarParticipante.equalTo("matricula", matricula);
            buscarParticipante.find({
                success : function(participanteDb) {
                    participante.set("nome", nome);
                    participante.set("matricula", matricula);
                    participante.set("ativo", true);
                    
                    if (participanteDb.length == 0) {
                        
                        participante.save().then(function() {
                            table.innerHTML += "<tr class='success'><td>"+matricula+"</td><td>"+nome+"</td><td>Importado com Sucesso!</td></tr>";    
                        }, 

                        function() {
                            table.innerHTML += "<tr class='danger'><td>"+matricula+"</td><td>"+nome+"</td><td>Ocorreu um erro durante a importação. Tente novamente</td></tr>";
                        });
                    } else {
                        participante.set("objectId", participanteDb[0].id);
                        participante.save().then(function() {
                            table.innerHTML += "<tr class='warning'><td>"+matricula+"</td><td>"+nome+"</td><td>Contato já existia e foi atualizado!</td></tr>";
                        }, 

                        function() {
                            table.innerHTML += "<tr class='danger'><td>"+matricula+"</td><td>"+nome+"</td><td>Ocorreu um erro durante a importação. Tente novamente</td></tr>";
                        });
                    }
                    
                }, 

                error : function (error) {
                    resultado.innerHTML += "<tr class='danger'><td>"+matricula+"</td><td>"+nome+"</td><td>Ocorreu um erro durante a importação. Tente novamente</td></tr>";   
                }
            });

        }
    });
 }

 function goListarParticipantes() {
   goTo("pages/listarparticipantes.html", function (){
     setTitle("Participantes", "Veja abaixo a lista de todos os participantes");
     var listaParticipantes = document.getElementById("listaParticipantes");

     var query = new Parse.Query(Parse.Object.extend("Participante"));
     query.find({
        success : function (list) {
            var table = "<table class='table table-striped'>";
            table += "<thead><td>Matricula</td><td>Nome</td><td></td></thead>";
            $(list).each( function(i, e) {
                table += "<tr><td>"+e.get("matricula")+"</td><td>"+e.get("nome")+
                "</td><td>"+
                "<button class='btn btn-default fa fa-edit' data-id='"+e.id+"' data-toggle='tooltip' title='Alterar Participante' onclick='alterarParticipante(this.dataset.id)'></button>"+
                "<button class='btn btn-default fa fa-trash' data-id='"+e.id+"' data-toggle='tooltip' title='Excluir Participante' onclick='excluirParticipante(this.dataset.id)'></button>"+
                "</td></tr>";
            });
            table += "</table>";
            listaParticipantes.innerHTML = table;
        }
     });
   });
 }

 function excluirParticipante(id) {
    if (confirm("Confirma e Exclusão?")) {
        var q = new Parse.Query(Parse.Object.extend("Participante"));
        q.get(id).then(function (participante) {
            participante.destroy().then(goListarParticipantes);
        });
    }
 }
 
 function alterarParticipante(id) {
    var q = new Parse.Query(Parse.Object.extend("Participante"));
    q.get(id).then(goCadastrarParticipante);
 }

 function goGerarRelatorioPercentualVotacao() {
    var perguntas = new Map();
    goTo("pages/relatorioQuantitativoVotacao.html", function() {
        setTitle("Resultado da Votação", "");

        var queryPerguntaAtiva = new Parse.Query(Parse.Object.extend("Pesquisa"));
        queryPerguntaAtiva.equalTo("ativa", true);

        var queryOpcoes = new Parse.Query(Parse.Object.extend("Opcao"));
        queryOpcoes.matchesQuery("parent", queryPerguntaAtiva);
        queryOpcoes.include("parent");
        
        queryOpcoes.find({ 
            success: function (opcoes){
                var content = document.getElementById("content");
                var conteudo = "";
                var pesquisa = opcoes[0].get("parent");
                conteudo += "<div>";
                conteudo += "   <h1>"+pesquisa.get("titulo")+"</h1>";
                conteudo += "   <h3>"+pesquisa.get("pergunta")+"</h3>"
                conteudo += "   <small>Total de votos&nbsp;<strong id='"+pesquisa.id+"'>0</strong></small>"
                conteudo += "</div>"
                $(opcoes).each(function(i, opcao){
                    conteudo += "<div class='well well-sm'>"
                    if (opcao.get("arquivo")) 
                        conteudo += "<img src='"+opcao.get("arquivo").url()+"' class='img-rounded' /></br>";
                    if (opcao.get("textoOpcao"))
                        conteudo += "<h3>"+opcao.get("textoOpcao")+"</h3>";
                    conteudo += "<center><h3 id='"+opcao.id+"' class='item-percentual' data-votos='0'>0</h3></center>"
                    conteudo += "</div>"
                });
                content.innerHTML = conteudo;

                var queryParticipantes = new Parse.Query(Parse.Object.extend("Participante"));
                queryParticipantes.matchesQuery("votos", queryOpcoes);
                
                queryParticipantes.find().then(function(votos){
                    var element = document.getElementById(pesquisa.id);
                    $(votos).each(function(i,e){
                        var q = e.relation("votos").query();
                        q.matchesQuery("parent", queryPerguntaAtiva);

                        q.find().then(function(e) {
                            $(e).each(function(i,e) {
                                var totalVotos = parseInt(element.innerHTML);
                                totalVotos++;

                                element.innerHTML = totalVotos;
                                var opc = document.getElementById(e.id);
                                var totalVotosOpc = parseInt(opc.dataset.votos);
                                totalVotosOpc++;
                                opc.dataset.votos = totalVotosOpc;

                                processarTotais(totalVotos);
                            })
                        });
                    });
                });
            }
        });
    })
 }

 function processarTotais(totalVotos) {
   $(".item-percentual").each(function(i, opcao){
       var totalVotosOpc = parseInt(opcao.dataset.votos);
       var percentual = (totalVotosOpc * 100) / totalVotos;
       opcao.innerHTML = percentual.toFixed(2) + " %";
   });
 }

 /*
    Funções gerais utilizadas nos menus.
  */

 function viewOpcao(opcao) {
    $(".hide-on-new").hide("slow");
    var opcoes = document.getElementById("newopc");
    
    var textoOpcao = "";
    var imagem;
    
    if (opcao) {
        textoOpcao = opcao.get("textoOpcao");
        imagem = opcao.get("arquivo") ? opcao.get("arquivo").url() : undefined;
    }
    var index = __opcoes.indexOf(opcao);

    opcoes.innerHTML = newOpc.replace("@OPC_TEXT", textoOpcao)
                             .replace("@OPC_IMG", imagem ? "<img src='"+imagem+"/>" : "")
                             .replace("@UPDATE_INDEX", index > -1 ? index : undefined);
 }

 function salvarOpcao(index) {
    var textoOpcao = document.getElementById("itextoOpcao").value;
    var arquivo = $("#iarquivo")[0];
    if (arquivo.files.length > 0) {
      var file = arquivo.files[0];
      var name = randonName();
      
      var parseFile = new Parse.File(name, file);
    }
    
    var Opcao = Parse.Object.extend("Opcao");
    var opcao = new Opcao();

    if (textoOpcao !== "") {
        opcao.set("textoOpcao", textoOpcao);
    }

    if (parseFile) {
        opcao.set("arquivo", parseFile);
    }
    
    if (index !== undefined) {
        __opcoes[index] = opcao;
        opcao.set("numero", index);
    } else {
        __opcoes.push(opcao);
        opcao.set("numero", __opcoes.length);
    }

    listarOpcoes();
 }

 function alterarOpcao(cod) {
    viewOpcao(__opcoes[cod]);
 }

function excluirOpcao(cod) {
    __opcoes.splice(cod, 1);
    listarOpcoes();
}

 function listarOpcoes() {
    document.getElementById("newopc").innerHTML = ""; 
    var _ = "";
    $(__opcoes).each(function (i, e) {
        _ += printOpc.replace("@OPC_IMAGE", e.get("arquivo") ? "<img src='"+e.get("arquivo").url()+"' alt='A imagem será carregada assim que a pesquisa for salva." : "")
                     .replace("@OPC_TEXT", e.get("textoOpcao") ? e.get("textoOpcao") : "")
                     .replace("@OPC_COD", __opcoes.indexOf(e))
                     .replace("@OPC_COD", __opcoes.indexOf(e));
    });
    document.getElementById("opcoes").innerHTML = _;
    $(".hide-on-new").show("slow");
 }

 function salvarPesquisa() {
   if (!__opcoes || __opcoes.length < 2) {
     alert("A pesquisa deve ter ao menos duas opções");
     return;
   } 

   var titulo = document.getElementById("ititulo").value;
   var pergunta = document.getElementById("ipergunta").value;

   if (titulo.trim() === "" || pergunta.trim() === "") {
     alert("Você deve informar todos os campos da pesquisa.");
   } else {
    var objectId = document.getElementById("objectId").value;
    
    Pesquisa = Parse.Object.extend("Pesquisa");
    pesquisa = new Pesquisa();
    
    pesquisa.set("titulo", titulo)  ;
    pesquisa.set("pergunta", pergunta);
    pesquisa.set("ativa", false);
    if (objectId)
        pesquisa.set("objectId", objectId);

    var opcoes = pesquisa.relation("opcoes");     
    $(__opcoes).each(function(i, e) {
        e.set("parent", pesquisa);
        e.save().then( function() {
            opcoes.add(e);
        });
    });

     pesquisa.save().then(homeAdmin);
   }

 }

function listarPesquisas(pesquisas) {
    var pesquisasAtivas = "";
    var pesquisasInativas = "";

    var item = "<div class='container-fluid'>"+
                "<h3>@TITULO </h3><small>@PERGUNTA</small>"+
                "<div class='container-inline'>@OPC</div>"+
                "</div>";
    
    var view = "<button data-toggle='tooltip' title='Visualizar Pesquisa' class='btn' data-id='@COD_PESQUISA' onclick='verPesquisa(this)'> <span class='fa fa-info'></span></button>";
    var edit = "<button data-toggle='tooltip' title='Alterar Pesquisa' class='btn' data-id='@COD_PESQUISA' onclick='alterarPesquisa(this)'> <span class='fa fa-edit'></span></button>";
    var ativar = "<button data-toggle='tooltip' title='Ativar Pesquisa' class='btn btn-primary' data-id='@COD_PESQUISA' onclick='ativarPesquisa(this)'> <span class=\'fa fa-bell\'> </span></button>";
    var desativar = "<button data-toggle='tooltip' title='Desativar Pesquisa' class='btn btn-danger' data-id='@COD_PESQUISA' onclick='desativarPesquisa(this)'> <span class='fa fa-bell-slash'></span></button>";
    
    var opc;

    $(pesquisas).each(function(i, e) {
        if (e.get("ativa")) {
            opc = view.replace("@COD_PESQUISA", e.id) +'&nbsp;'+ desativar.replace("@COD_PESQUISA", e.id);
            pesquisasAtivas += item.replace("@TITULO", e.get("titulo"))
                                   .replace("@PERGUNTA", e.get("pergunta"))
                                   .replace("@OPC", opc);
        } else {
            opc = view.replace("@COD_PESQUISA", e.id) + '&nbsp;' + edit.replace("@COD_PESQUISA", e.id) + '&nbsp;' + ativar.replace("@COD_PESQUISA", e.id);
            pesquisasInativas += item.replace("@TITULO", e.get("titulo"))
                                      .replace("@PERGUNTA", e.get("pergunta"))
                                      .replace("@OPC", opc);
        }
    });

    $(".pesquisa-ativa").html(pesquisasAtivas !== "" ? pesquisasAtivas : "Nenhuma pesquisa ativa no momento.");
    $(".pesquisas").html(pesquisasInativas !== "" ? pesquisasInativas : "Nenhuma pesquisa encontrada.");
}

 function verPesquisa(element) {
    query = new Parse.Query(Parse.Object.extend("Pesquisa"));
    query.equalTo("objectId", element.dataset.id);
    query.find({
        success : function (data) {
            var obj = data[0];
            goCadastrarPesquisa(obj, true);
        }, error : function (error) {
            console.log("error");
        }
    });  
 }

 function alterarPesquisa(element) {
    query = new Parse.Query(Parse.Object.extend("Pesquisa"));
    query.equalTo("objectId", element.dataset.id);
    query.find({
        success : function (data) {
            var obj = data[0];
            goCadastrarPesquisa(obj);
        }, error : function (error) {
            console.log("error");
        }
    });  
 }

 function ativarPesquisa(element) {
    //startParse();
    var query = new Parse.Query(Parse.Object.extend("Pesquisa"));
    //desativar todas as pesquisas
    query.equalTo("ativa", true);
    query.find({
        success : function(data) {
            $(data).each(function (i,e) {
                e.set("ativa", false);
                e.save();
            });
        }
    });
    // Agora vou ativar a pesquisa selecionada
    query = new Parse.Query(Parse.Object.extend("Pesquisa"));
    query.equalTo("objectId", element.dataset.id);
    query.find({
        success : function (data) {
            var obj = data[0];
            obj.set("ativa", true);
            obj.save(null, {
                success : function (a) {
                    goVisualizarPesquisas();
                }
            });
        }, error : function (error) {
            console.log("error");
        }
    });
 }

 function desativarPesquisa(element) {
    query = new Parse.Query(Parse.Object.extend("Pesquisa"));
    query.equalTo("objectId", element.dataset.id);
    query.find({
        success : function (data) {
            var obj = data[0];
            obj.set("ativa", false);
            obj.save(null, {
                success : function (a) {
                    goVisualizarPesquisas();
                }
            });
        }, error : function (error) {
            console.log("error");
        }
    });
 }

 function salvarParticipante() {
    var matricula = document.getElementById("imatricula").value;
    var nome = document.getElementById("inome").value;
    var id = document.getElementById("participanteId").value;

    var Participante = Parse.Object.extend("Participante");
    var participante = new Participante();
    if (id) {
        participante.set("objectId", id);
    }
    participante.set("matricula", matricula);
    participante.set("nome", nome);
    participante.set("ativo", true);

    participante.save().then(function (participante){
        if (id.trim() !== "") {
            goListarParticipantes();
            return
        }
        goCadastrarParticipante();
    }); 
 }

//////////////////////

function randonName() {
    //TODO criar um nome único. Náo tem muita importäncia, apenas por caprixo mesmo
    return "imagem";
}

function goTo(page, complete) {
    var loading = $(".loading");
    loading.show();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            content.innerHTML = this.responseText;
            var retorno;
            if (complete) 
                retorno = complete();

            if (Parse.User.current()) {
                $(".logoff").fadeIn();
            } else {
                $(".logoff").fadeOut();
            }
            
            $("[data-toggle='tooltip']").tooltip();
            loading.hide();
            return retorno;
        }
    }
    xmlhttp.open("GET", page, true);
    xmlhttp.send();
}

function setTitle(title, subtitle) {
    $(".page-title").html(title);
    if (subtitle)
        $(".page-subtitle").html(subtitle);
}

function startParse() {
    Parse.initialize("c0ppHCN9En9JFhExK7H7HaYZeRNNOGnHCjCvTnyE", "PQrtHfb683zjR9pSHHwzeyWO34uT3mFZqpPQHeAK");
    //Parse.initialize("AMWPVkiXCTh491UdP5PU5qP4qbRkuFnr3wQYwkq2", "wpz9034zJoF6avWKTvRk6jSqTN2PHoZC3LIrF8Rt");
}

