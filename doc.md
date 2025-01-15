# Rotas

### Agendamento

> POST `/agendamento/` :
```
    id_quadra: int
    id_usuario: int
    data: dd/mm/yyyy
    inicio: hh:mm:ss
    fim: hh:mm:ss
```

- É necessário estar autenticado
- Possiveis retornos:
    - 201 - Created (sucesso)
    - 401 - Not autheticated (caso não esteja logado)
    - 422 - Unpressable Entity (caso algum parâmetro esteja errado)

> GET `/agendamento/todos_agendamentos` :
- Não são necessários parâmetros
- É necessário perfil de administrador
- Retorna todos agendamentos de todos usuários
- Possiveis retornos:
    - 200 - Successful Response (sucesso)
        ```
            [
                {
                    id_quadra: int
                    id_usuario: int
                    data: dd/mm/yyyy
                    inicio: hh:mm:ss
                    fim: hh:mm:ss
                    id: int
                }
            ]
        ```
    - 401 - Not authenticated (caso não esteja logado)
    - 401 - Unauthorized (caso o perfil não seja admin)

> GET `/agendamento/agendamentos_futuros` :
- Não são necessários parâmetros
- Retorna todos agendamentos futuros do usuário atual
- Possiveis retornos:
    - 200 - 200 - Successful Response (sucesso)
    - 401 - Not authenticated (caso não esteja logado)

> GET `/agendamento/todos_agendamentos_futuros` :
- Não são necessários parâmetros
- É necessário perfil de administrador
- Retorna todos agendamentos futuros de todos usuários
- Possiveis retornos:
    - 200 - Successful Response (sucesso)
    - 401 - Not authenticated (caso não esteja logado)
    - 401 - Unauthorized (caso o perfil não seja admin)

> GET `/agendamento/agendamentos_futuros_quadra` :
- Não são necessários parâmetros
- É necessário perfil de administrador
- Retorna todos agendamentos futuros da quadra
- Possiveis retornos:
    - 200 - Successful Response (sucesso)
    - 401 - Not authenticated (caso não esteja logado)
    - 401 - Unauthorized (caso o perfil não seja admin)

> DELETE `agendamento/{agendamento_id}` :
```
    agendamento_id: int
```
- É necessário ter o mesmo id de usuário do agendamento
- Possiveis retornos:
    - 200 - Successful Response (sucesso)
    - 401 - Not authenticated (caso não esteja logado)
    - 404 - Not found (caso o agendamento não exista)

### Autenticação
> POST `auth/token` :
```
    username: string
    password: string
```
- Possiveis retornos:
    - 200 - Successful Response (sucesso)
        ```
            access_token: string (token valido por 30m)
            token_type: string
        ```
    - 400 - Bad Request (email ou senha incorretos)

> POST `/auth/refresh_toekn` :
- Não são necessários parâmetros
- É necessário estar logado
- Atualiza o token por mais 30 minutos
- Possiveis retornos:
    - Possiveis retornos:
    - 200 - Successful Response (sucesso)
        ```
            access_token: string (token valido por 30m)
            token_type: string
        ```
    - 401 - Not authenticated (caso não esteja logado)

### Usuários
> POST `/users`:
```
    nome: string
    cpf: string
    email: string (valida apenas @.)
    perfil: cliente ou admin
    senha: string
```
- Só é possível criar um usuário admin usando outro usuário admin
- Possiveis retornos:
    - 201 - Created (sucesso)
        ```
            id: int
            nome: string
            cpf: string
            email: string
        ```
    - 422 - Unpressable Entity (caso algum parâmetro esteja errado)

> GET `/users` :
- Não são necessários parâmetros
- É necessário estar logado e o perfil deve ser admin
- Possiveis retornos:
    - Possiveis retornos:
    - 200 - Successful Response (sucesso)
        ```
            users: [
                {
                    id: int
                    nome: string
                    cpf: string
                    email: string
                }
            ]
        ```
    - 401 - Not authenticated (caso não esteja logado)
    - 401 - Unauthorized (caso perfil não seja admin)

> DELETE `/users` :
- Não são necessários parâmetros
- É necessário estar logado
- Exclui o usuário atual caso não tenha nenhum agendamento
- Possiveis retornos:
    - Possiveis retornos:
    - 204 - No Content (sucesso)
    - 401 - Not authenticated (caso não esteja logado)
    - 404 - Bad Request (caso o usuário tenha agendamentos futuros)

### Quadras
> GET `/quadras` :
- Não são necessários parâmetros
- Não é necessário estar logado
- Possiveis retornos:
    - 200 - Successful Response
        ```
            [
                {
                    nome: string
                    descricao: string
                    id: int
                    disopnivel: bool
                }
            ]
        ```

> POST `/quadras` :
```
    nome: string
    descricao: string
    disponivel: bool
```
- É necessário estar logado
- Só é possível criar quadras com usuário admin
- Possiveis retornos:
    - 201 - Created (sucesso)
        ```
            id: int
            nome: string
            descricao: string
            disponivel: bool
        ```
    - 401 - Not authenticated (caso não esteja logado)
    - 401 - Unauthorized (caso o perfil não seja admin)
    - 422 - Unpressable Entity (caso algum parâmetro esteja errado)

> DELETE `/quadras/{quadra_id}` :
- É necessário enviar o id da quadra
- É necessário estar logado e ter perfil admin
- Exclui a quadra caso não tenha nenhum agendamento futuro
- Possiveis retornos:
    - 204 - No Content (sucesso)
    - 401 - Not authenticated (caso não esteja logado)
    - 401 - Unauthorized (caso o perfil não seja admin)
    - 404 - Bad Request (caso a quadra tenha agendamentos futuros)
