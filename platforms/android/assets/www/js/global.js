var host = "ec2-54-207-12-208.sa-east-1.compute.amazonaws.com:8080"
var botaoAcaoAtividade;
var iniciarAtividade;
var finalizarAtividade;

document.addEventListener("deviceready", onDeviceReady, false);

function checkPreAuth() {
    var form = $("#form");
    if (window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
        $("#username", form).val(window.localStorage["username"]);
        $("#password", form).val(window.localStorage["password"]);
        handleLogin();
    }
}

function handleLogin() {
    var u = $("#username", this).val();
    var p = $("#password", this).val();
    if (u != '' && p != '') {
        $.post("http://" + host + "/SmartClass/autenticar/json", {"usuario.login": u, "usuario.senha": p}, function(res) {
            if (res.loginOk == 'true') {
                window.localStorage["username"] = u;
                window.localStorage["password"] = p;
                if (res.professor == 'true') {
                    window.location.href = "professor/professor.html";
                }
                if (res.aluno == 'true') {
                    window.location.href = "aluno/aluno.html";
                }
            } else {
                navigator.notification.alert(
                        'Login ou senha incorretos!',
                        function() {
                        },
                        'Erro',
                        'Ok'
                        );
            }
        }, "json");
    } else {
        navigator.notification.alert(
                'Favor informar usuário e senha!',
                function() {
                },
                'Erro',
                'Ok'
                );
    }
    return false;
}

function carregarListaAtividadesAluno() {
    try {
        $.ajax({
            type: "GET",
            url: "http://" + host + "/SmartClass/atividades/json/aluno/now",
            dataType: "json",
            success: function(data) {
                $.each(data, function(indexAtividade, atividade) {
                    $('#atividade-list').append('<li id="li-atividade-' + atividade.id + '"><a href="#" data-id="' + atividade.id + '">Atividade:' + atividade.descricao + '</a><a href="#questao' + atividade.id + '" data-rel="dialog" data-transition="pop">Questões</a></li>');
                    try {
                        if ($('#atividade-list').hasClass('ui-listview')) {
                            $('#atividade-list').listview('refresh');
                        }
                        else {
                            $('#atividade-list').listview().listview('refresh');
                        }
                    } catch (e) {
                        navigator.notification.alert(
                                'Erro:"' + e.message + '" ao realizar a operação, contate o administrador.',
                                function() {
                                },
                                'Erro',
                                'Ok'
                                );
                    }
                    $('body').append('<div data-role="page" id="questao' + atividade.id + '"><div data-role="content"><a href="#" data-role="button" data-rel="back" data-inline="true" data-mini="true">Voltar</a></div></div>');
                    $.each(atividade.questoes, function(indexQuestao, questao) {
                        var listaOpcoes = '<ul data-role="listview" data-inset="true">';
                        $.each(questao.opcoes, function(indexOpcao, opcao) {
                            listaOpcoes += '<li><a href="#" class="resposponder" data-idaula="' + atividade.idAula + '" data-idatividade="' + atividade.id + '" data-idquestao="' + questao.id + '" data-idopcao="' + opcao.id + '">' + opcao.descricao + '</a></li>';
                        });
                        listaOpcoes += '</ul>';
                        $('#questao' + atividade.id + ' > div').prepend('<div data-role="collapsible-set" data-content-theme="d" id="questao-container' + questao.id + '"><h3>Questao: ' + questao.descricao + '</h3>' + listaOpcoes + '</div>');

                    });
                });
                $(".resposponder").on("click", function() {
                    var idQuestao = $(this).data('idquestao');
                    var idOpcao = $(this).data('idopcao');
                    var idAtividade = $(this).data('idatividade');
                    var idAula = $(this).data('idaula');

                    navigator.notification.confirm(
                            'Confirma a resposta utilizando esta opcao?', // message
                            function(buttonIndex) {
                                if (buttonIndex == 2) {
                                    $.post("http://" + host + "/SmartClass/respostas/json/", {"alunoRespostaQuestao.aula.id": idAula, "alunoRespostaQuestao.atividade.id": idAtividade, "alunoRespostaQuestao.questao.id": idQuestao, "alunoRespostaQuestao.opcao.id": idOpcao}, function(res) {
                                        if (res == 'true') {
                                            return true;
                                            $('#questao-container' + idQuestao).remove();
                                        }
                                    }, "json");
                                    return;
                                } else {
                                    return;
                                }
                            },
                            'Questao',
                            'Nao,Sim'
                            );
                });
            }
        });
    } catch (e) {
        navigator.notification.alert(
                'Erro:"' + e.message + '" ao realizar a operação, contate o administrador.',
                function() {
                },
                'Erro',
                'Ok'
                );
    }
}

function carregarListaAulas() {
    try {
        $.ajax({
            type: "GET",
            url: "http://" + host + "/SmartClass/aulas/json/now",
            dataType: "json",
            success: function(data) {
                $('#aula-list').append('<div data-role="collapsible" id="set1" data-collapsed="true"><h3>Aula: ' + data.descricao + ' - Turma: ' + data.turma + '</h3><ul data-role="listview" id="list-aula' + data.id + '"></ul></div>');
                try {
                    if ($('#aula-list').hasClass('ui-collapsible')) {
                        $('#aula-list').collapsibleset('refresh');
                    }
                    else {
                        $('#aula-list').collapsibleset('refresh');
                    }
                } catch (e) {
                    navigator.notification.alert(
                            'Erro:"' + e.message + '" ao realizar a operação, contate o administrador.',
                            function() {
                            },
                            'Erro',
                            'Ok'
                            );
                }
                $.each(data.atividades, function(indexAtividade, atividade) {
                    $('#list-aula' + data.id).append('<li id="li-atividade-' + atividade.id + '"><a href="#" data-id="' + atividade.id + '">Atividade:' + atividade.descricao + '</a><a href="#questao' + atividade.id + '" data-rel="dialog" data-transition="pop">Questões</a></li>');
                    try {
                        if ($('#list-aula' + data.id).hasClass('ui-listview')) {
                            $('#list-aula' + data.id).listview('refresh');
                        }
                        else {
                            $('#list-aula' + data.id).listview().listview('refresh');
                        }
                    } catch (e) {
                        navigator.notification.alert(
                                'Erro:"' + e.message + '" ao realizar a operação, contate o administrador.',
                                function() {
                                },
                                'Erro',
                                'Ok'
                                );
                    }
                    botaoAcaoAtividade;
                    iniciarAtividade = '<a href="#" class="iniciar-atividade" data-rel="back" id="botao-iniciar' + atividade.id + '" data-idatividade="' + atividade.id + '" data-role="button" data-inline="true" data-mini="true">Iniciar Atividade</a>';
                    finalizarAtividade = '<a href="#" class="encerrar-atividade" data-rel="back" id="botao-encerrar' + atividade.id + '" data-idatividade="' + atividade.id + '" data-role="button" data-inline="true" data-mini="true">Encerrar Atividade</a>';
                    if (atividade.status == '1')
                        botaoAcaoAtividade = iniciarAtividade;
                    if (atividade.status == '2')
                        botaoAcaoAtividade = finalizarAtividade;

                    $('body').append('<div data-role="page" id="questao' + atividade.id + '"><div data-role="content">' + botaoAcaoAtividade + '<a href="#" data-role="button" data-rel="back" data-inline="true" data-mini="true">Voltar</a></div></div>');
                    $.each(atividade.questoes, function(indexQuestao, questao) {
                        $('#questao' + atividade.id + ' > div').prepend('<h3>Questao: ' + questao.descricao + '</h3>');
                    });
                });
                $(".iniciar-atividade").on("click", function() {
                    try {
                        var idatividade = $(this).data('idatividade');
                        $.ajax({
                            type: "GET",
                            url: "http://" + host + "/SmartClass/atividades/iniciar/" + idatividade,
                            dataType: "json",
                            success: function(data) {
                                $('#log').append('data...<br>' + data);
                                if (data == 'true') {
                                    finalizarAtividade = '<a href="#" class="encerrar-atividade" data-rel="back" id="botao-encerrar' + idatividade + '" data-idatividade="' + idatividade + '" data-role="button" data-inline="true" data-mini="true">Encerrar Atividade</a>';
                                    $('#botao-iniciar' + atividade.id).remove();
                                    $('#questao' + atividade.id).prepend(finalizarAtividade);
                                    navigator.notification.alert(
                                            'Atividade iniciada com sucesso!',
                                            function() {
                                            },
                                            'Mensagem',
                                            'Ok'
                                            );
                                }
                            }
                        });
                    } catch (e) {
                        navigator.notification.alert(
                                'Erro:"' + e.message + '" ao realizar a operação, contate o administrador.',
                                function() {
                                },
                                'Erro',
                                'Ok'
                                );
                    }
                });
                $(".encerrar-atividade").on("click", function() {
                    try {
                        var idatividade = $(this).data('idatividade');
                        $.ajax({
                            type: "GET",
                            url: "http://" + host + "/SmartClass/atividades/encerrar/" + idatividade,
                            dataType: "json",
                            success: function(data) {
                                if (data == 'true') {
                                    $('#li-atividade-' + idatividade).remove();
                                    navigator.notification.alert(
                                            'Atividade encerrada com sucesso!',
                                            function() {
                                            },
                                            'Mensagem',
                                            'Ok'
                                            );
                                }
                            }
                        });
                    } catch (e) {
                        navigator.notification.alert(
                                'Erro:"' + e.message + '" ao realizar a operação, contate o administrador.',
                                function() {
                                },
                                'Erro',
                                'Ok'
                                );
                    }
                });
            }
        });
    } catch (e) {
        navigator.notification.alert(
                'Erro:"' + e.message + '" ao realizar a operação, contate o administrador.',
                function() {
                },
                'Erro',
                'Ok'
                );
    }
}

function onDeviceReady() {
    $("#form").on("submit", handleLogin);

    if ($.mobile.activePage.attr("id") == 'page-professor') {
        carregarListaAulas();
    }

    if ($.mobile.activePage.attr("id") == 'page-aluno') {
        carregarListaAtividadesAluno();
    }

    $('#close-button').click(function() {
        navigator.app.exitApp();
    })

    $('#atividades-refresh-button').click(function() {
        carregarListaAtividadesAluno();
    })



    $(document).ajaxStart(function() {
        $.mobile.showPageLoadingMsg();
    });

    $(document).ajaxStop(function() {
        $.mobile.hidePageLoadingMsg();
    });

    $(document).ajaxError(function(event, jqxhr, settings, exception) {

        var erro = '<br>' + "===ERROR RESUME===" + '<br>';
        erro += jqxhr.status + '<br>';
        erro += jqxhr.statusText + '<br>';
        erro += jqxhr.responseText + '<br>';
        erro += jqxhr.getAllResponseHeaders() + '<br>';

        navigator.notification.alert(
                'Erro:"' + e.erro + '" ao realizar a operação, contate o administrador.',
                function() {
                },
                'Erro',
                'Ok'
                );
    });
}