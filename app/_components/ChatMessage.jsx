import SqlQueryDisplay from './SqlQueryDisplay'

{message.response?.sqlQuery && (
  <SqlQueryDisplay sqlQuery={message.response.sqlQuery} />
)} 