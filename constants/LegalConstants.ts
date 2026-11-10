
export const LEGAL_CONFIG = {
    PRIVACY_POLICY_URL: "https://your-app-url.run.app/privacy",
    TERMS_URL: "https://your-app-url.run.app/terms",
    LAST_UPDATED: "October 16, 2026",
};

export const PRIVACY_POLICY = `
# Privacy Policy

**Effective Date: October 16, 2026**

## 1. Introduction
This Privacy Policy describes how LedgerAI (the "Service") collects, use, and disclose your personal information when you use our services. We are committed to protecting your privacy and ensuring the security of your financial data. By using our service, you agree to the collection and use of information in accordance with this policy.

## 2. Information We Collect
### 2.1 Financial Data via Plaid
We use Plaid, Inc. ("Plaid") to connect your bank accounts. By using our service, you grant us and Plaid the right, power, and authority to act on your behalf to access and transmit your personal and financial information from the relevant financial institution.
- **Account Identifiers:** Name, account type, and partial account numbers.
- **Transaction History:** Transaction dates, amounts, and descriptions for the past 24 months.
- **Balances:** Real-time account balances to provide accurate financial snapshots.

### 2.2 User-Provided Information
- **Account Details:** Name, email address, and profile preferences.
- **Communication:** Records of any correspondence with our support team.
- **User Content:** Any notes, categories, or custom data you manually enter into the application.

### 2.3 Automatically Collected Information
- **Usage Data:** Information on how you interact with the application, including features used and time spent.
- **Device Information:** IP address, browser type, and operating system for security and optimization purposes.

## 3. How We Use Your Information
- **AI-Powered Analysis:** User financial data is processed by Google Gemini AI for categorization and insight generation. Data is not used by Google to train foundation models for other users. **Your data is processed securely and is not used to train public AI models.**
- **Service Delivery:** To maintain your account and provide the core features of the expense tracker.
- **Service Improvement:** To analyze usage trends and improve the application's functionality.
- **Security & Compliance:** To detect and prevent fraud, unauthorized access, and comply with legal obligations.

## 4. Data Security & Encryption
We protect your data with the following safeguards:
- **Encryption in Transit:** All communication between the app, our servers and our service providers uses TLS 1.2 or higher.
- **Encryption at Rest:** Our database, hosted by Supabase, is encrypted at rest with AES-256. Bank access tokens are additionally encrypted by our application before they are stored, and are never sent to your device.
- **Account Security:** Passwords are stored only as salted bcrypt hashes, never in readable form. Login attempts are rate-limited to block password-guessing attacks.
- **Data Isolation:** Every request for financial data is checked against the signed-in account, so each user can only access their own data.
- **Access Control:** Access to production systems is limited to authorized personnel on a least-privilege basis and requires multi-factor authentication.

## 5. Data Sharing & Third Parties
We do not sell your personal information. We share data only with:
- **Plaid:** To facilitate bank connectivity.
- **Supabase:** For database hosting.
- **Google Cloud:** For application hosting and AI processing (Google Gemini).
- **Ad Partners:** Since the Free Tier is ad-supported, we may share anonymized device identifiers with advertising partners (such as Google AdMob) to serve non-personalized advertisements to users on the Free Tier.
- **Legal Authorities:** When required by law or to protect our legal rights, property, or safety.

## 6. Your Rights & Data Deletion
### 6.1 Right to Access and Portability
You have the right to request a copy of the personal data we hold about you in a structured, machine-readable format.

### 6.2 Right to be Forgotten
You have the right to request the deletion of your personal data at any time.
- **Account Deletion:** When you delete your account, your account details, ledger and bank data are permanently deleted from our production database immediately, and our access to your linked banks is revoked with Plaid. Residual copies in encrypted database backups expire automatically within 30 days.
- **Bank Disconnection:** When you disconnect a bank, we revoke our access with Plaid and immediately delete the accounts, balances and transactions we retrieved from that institution. Transactions you previously imported into your ledger remain part of your records unless you choose to remove them when disconnecting, or delete them later.
- **Requests by Email:** You can also request deletion, or a copy of your data, by emailing us at **tradelab.mantis@gmail.com**. We respond within 30 days.

### 6.3 GDPR & CCPA Compliance
If you are a resident of the European Economic Area (EEA) or California, you have specific rights regarding your personal information, including the right to access, correct, or delete your data.

## 7. Cookies and Tracking
We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for advertising purposes.

## 8. Children's Privacy
Our service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children.

## 9. Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date."

## 10. Contact Us
If you have any questions about this Privacy Policy or our data practices, please contact us at: **tradelab.mantis@gmail.com**
`;

export const PRIVACY_POLICY_FR = `
# Politique de Confidentialité

**Date d'entrée en vigueur : 16 octobre 2026**

## 1. Introduction
Cette politique de confidentialité décrit comment LedgerAI (le « Service ») collecte, utilise et divulgue vos informations personnelles lorsque vous utilisez nos services. Nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos données financières. En utilisant notre service, vous acceptez la collecte et l'utilisation des informations conformément à cette politique.

## 2. Informations que nous collectons
### 2.1 Données financières via Plaid
Nous utilisons Plaid, Inc. (« Plaid ») pour connecter vos comptes bancaires. En utilisant notre service, vous nous accordez, ainsi qu'à Plaid, le droit, le pouvoir et l'autorité d'agir en votre nom pour accéder à vos informations personnelles et financières et les transmettre à partir de l'institution financière concernée.
- **Identifiants de compte :** Nom, type de compte et numéros de compte partiels.
- **Historique des transactions :** Dates, montants et descriptions des transactions pour les 24 derniers mois.
- **Soldes :** Soldes des comptes en temps réel pour fournir des instantanés financiers précis.

### 2.2 Informations fournies par l'utilisateur
- **Détails du compte :** Nom, adresse e-mail et préférences de profil.
- **Communication :** Enregistrements de toute correspondance avec notre équipe d'assistance.
- **Contenu utilisateur :** Toutes notes, catégories ou données personnalisées que vous saisissez manuellement dans l'application.

### 2.3 Informations collectées automatiquement
- **Données d'utilisation :** Informations sur la façon dont vous interagissez avec l'application, y compris les fonctionnalités utilisées et le temps passé.
- **Informations sur l'appareil :** Adresse IP, type de navigateur et système d'exploitation à des fins de sécurité et d'optimisation.

## 3. Comment nous utilisons vos informations
- **Analyse alimentée par l'IA :** Les données financières des utilisateurs sont traitées par l'IA Google Gemini pour la catégorisation et la génération d'informations. Les données ne sont pas utilisées par Google pour entraîner des modèles de base pour d'autres utilisateurs. **Vos données sont traitées de manière sécurisée et ne sont pas utilisées pour entraîner des modèles d'IA publics.**
- **Prestation de service :** Pour maintenir votre compte et fournir les fonctionnalités de base du suivi des dépenses.
- **Amélioration du service :** Pour analyser les tendances d'utilisation et améliorer les fonctionnalités de l'application.
- **Sécurité et conformité :** Pour détecter et prévenir la fraude, les accès non autorisés et se conformer aux obligations légales.

## 4. Sécurité et cryptage des données
Nous protégeons vos données grâce aux mesures suivantes :
- **Cryptage en transit :** Toutes les communications entre l'application, nos serveurs et nos prestataires de services utilisent TLS 1.2 ou supérieur.
- **Cryptage au repos :** Notre base de données, hébergée par Supabase, est cryptée au repos avec AES-256. Les jetons d'accès bancaires sont en outre cryptés par notre application avant d'être stockés, et ne sont jamais envoyés à votre appareil.
- **Sécurité du compte :** Les mots de passe sont stockés uniquement sous forme de hachages bcrypt salés, jamais sous forme lisible. Les tentatives de connexion sont limitées pour bloquer les attaques par devinette de mot de passe.
- **Isolation des données :** Chaque demande de données financières est vérifiée par rapport au compte connecté, de sorte que chaque utilisateur ne peut accéder qu'à ses propres données.
- **Contrôle d'accès :** L'accès aux systèmes de production est limité au personnel autorisé selon le principe du moindre privilège et nécessite une authentification multifacteur.

## 5. Partage de données et tiers
Nous ne vendons pas vos informations personnelles. Nous partageons des données uniquement avec :
- **Plaid :** Pour faciliter la connectivité bancaire.
- **Supabase :** Pour l'hébergement de la base de données.
- **Google Cloud :** Pour l'hébergement de l'application et le traitement de l'IA (Google Gemini).
- **Partenaires publicitaires :** Étant donné que le niveau gratuit est financé par la publicité, nous pouvons partager des identifiants d'appareil anonymisés avec des partenaires publicitaires (tels que Google AdMob) pour diffuser des publicités non personnalisées aux utilisateurs du niveau gratuit.
- **Autorités légales :** Lorsque la loi l'exige ou pour protéger nos droits légaux, nos biens ou notre sécurité.

## 6. Vos droits et suppression de données
### 6.1 Droit d'accès et de portabilité
Vous avez le droit de demander une copie des données personnelles que nous détenons à votre sujet dans un format structuré et lisible par machine.

### 6.2 Droit à l'oubli
Vous avez le droit de demander la suppression de vos données personnelles à tout moment.
- **Suppression du compte :** Lorsque vous supprimez votre compte, les détails de votre compte, votre registre et vos données bancaires sont immédiatement et définitivement supprimés de notre base de données de production, et notre accès à vos banques liées est révoqué auprès de Plaid. Les copies résiduelles dans les sauvegardes cryptées de la base de données expirent automatiquement dans un délai de 30 jours.
- **Déconnexion bancaire :** Lorsque vous déconnectez une banque, nous révoquons notre accès auprès de Plaid et supprimons immédiatement les comptes, soldes et transactions que nous avons récupérés auprès de cette institution. Les transactions que vous avez précédemment importées dans votre registre restent dans vos dossiers, sauf si vous choisissez de les supprimer lors de la déconnexion ou de les supprimer plus tard.
- **Demandes par e-mail :** Vous pouvez également demander la suppression ou une copie de vos données en nous écrivant à **tradelab.mantis@gmail.com**. Nous répondons dans un délai de 30 jours.

### 6.3 Conformité RGPD et CCPA
Si vous résidez dans l'Espace économique européen (EEE) ou en Californie, vous disposez de droits spécifiques concernant vos informations personnelles, notamment le droit d'accéder à vos données, de les corriger ou de les supprimer.

## 7. Cookies et suivi
Nous utilisons des cookies essentiels pour maintenir votre session et vos préférences. Nous n'utilisons pas de cookies de suivi tiers à des fins publicitaires.

## 8. Vie privée des enfants
Notre service n'est pas destiné à être utilisé par des enfants de moins de 13 ans. Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants.

## 9. Modifications de cette politique
Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page et en mettant à jour la « Date d'entrée en vigueur ».

## 10. Contactez-nous
Si vous avez des questions sur cette politique de confidentialité ou sur nos pratiques en matière de données, veuillez nous contacter à : **tradelab.mantis@gmail.com**
`;

export const PRIVACY_POLICY_ES = `
# Política de Privacidad

**Fecha de entrada en vigor: 16 de octubre de 2026**

## 1. Introducción
Esta Política de Privacidad describe cómo LedgerAI (el "Servicio") recopila, utiliza y divulga su información personal cuando utiliza nuestros servicios. Estamos comprometidos a proteger su privacidad y garantizar la seguridad de sus datos financieros. Al utilizar nuestro servicio, usted acepta la recopilación y el uso de información de acuerdo con esta política.

## 2. Información que recopilamos
### 2.1 Datos financieros a través de Plaid
Utilizamos Plaid, Inc. ("Plaid") para conectar sus cuentas bancarias. Al utilizar nuestro servicio, usted nos otorga a nosotros y a Plaid el derecho, el poder y la autoridad para actuar en su nombre para acceder y transmitir su información personal y financiera de la institución financiera correspondiente.
- **Identificadores de cuenta:** Nombre, tipo de cuenta y números de cuenta parciales.
- **Historial de transacciones:** Fechas, montos y descripciones de transacciones de los últimos 24 meses.
- **Saldos:** Saldos de cuenta en tiempo real para proporcionar instantáneas financieras precisas.

### 2.2 Información proporcionada por el usuario
- **Detalles de la cuenta:** Nombre, dirección de correo electrónico y preferencias de perfil.
- **Comunicación:** Registros de cualquier correspondencia con nuestro equipo de soporte.
- **Contenido del usuario:** Cualquier nota, categoría o dato personalizado que ingrese manualmente en la aplicación.

### 2.3 Información recopilada automáticamente
- **Datos de uso:** Información sobre cómo interactúa con la aplicación, incluidas las funciones utilizadas y el tiempo dedicado.
- **Información del dispositivo:** Dirección IP, tipo de navegador y sistema operativo para fines de seguridad y optimización.

## 3. Cómo utilizamos su información
- **Análisis impulsado por IA:** Los datos financieros del usuario son procesados por la IA de Google Gemini para la categorización y generación de información. Google no utiliza los datos para entrenar modelos base para otros usuarios. **Sus datos se procesan de forma segura y no se utilizan para entrenar modelos de IA públicos.**
- **Entrega del servicio:** Para mantener su cuenta y proporcionar las funciones principales del rastreador de gastos.
- **Mejora del servicio:** Para analizar las tendencias de uso y mejorar la funcionalidad de la aplicación.
- **Seguridad y cumplimiento:** Para detectar y prevenir fraudes, accesos no autorizados y cumplir con las obligaciones legales.

## 4. Seguridad y cifrado de datos
Protegemos sus datos con las siguientes medidas:
- **Cifrado en tránsito:** Toda la comunicación entre la aplicación, nuestros servidores y nuestros proveedores de servicios utiliza TLS 1.2 o superior.
- **Cifrado en reposo:** Nuestra base de datos, alojada por Supabase, está cifrada en reposo con AES-256. Los tokens de acceso bancario se cifran además en nuestra aplicación antes de almacenarse y nunca se envían a su dispositivo.
- **Seguridad de la cuenta:** Las contraseñas se almacenan únicamente como hashes bcrypt con sal, nunca en forma legible. Los intentos de inicio de sesión están limitados para bloquear ataques de adivinación de contraseñas.
- **Aislamiento de datos:** Cada solicitud de datos financieros se verifica contra la cuenta que ha iniciado sesión, de modo que cada usuario solo puede acceder a sus propios datos.
- **Control de acceso:** El acceso a los sistemas de producción está limitado al personal autorizado según el principio de menor privilegio y requiere autenticación multifactor.

## 5. Intercambio de datos y terceros
No vendemos su información personal. Compartimos datos solo con:
- **Plaid:** Para facilitar la conectividad bancaria.
- **Supabase:** Para el alojamiento de la base de datos.
- **Google Cloud:** Para el alojamiento de la aplicación y el procesamiento de IA (Google Gemini).
- **Socios publicitarios:** Dado que el Nivel Gratuito se financia con publicidad, podemos compartir identificadores de dispositivos anónimos con socios publicitarios (como Google AdMob) para mostrar anuncios no personalizados a los usuarios del Nivel Gratuito.
- **Autoridades legales:** Cuando lo exija la ley o para proteger nuestros derechos legales, propiedad o seguridad.

## 6. Sus derechos y eliminación de datos
### 6.1 Derecho de acceso y portabilidad
Tiene derecho a solicitar una copia de los datos personales que tenemos sobre usted en un formato estructurado y legible por máquina.

### 6.2 Derecho al olvido
Tiene derecho a solicitar la eliminación de sus datos personales en cualquier momento.
- **Eliminación de la cuenta:** Cuando elimina su cuenta, los detalles de su cuenta, su libro contable y sus datos bancarios se eliminan de forma inmediata y permanente de nuestra base de datos de producción, y nuestro acceso a sus bancos vinculados se revoca ante Plaid. Las copias residuales en las copias de seguridad cifradas de la base de datos caducan automáticamente en un plazo de 30 días.
- **Desconexión bancaria:** Cuando desconecta un banco, revocamos nuestro acceso ante Plaid y eliminamos de inmediato las cuentas, saldos y transacciones que obtuvimos de esa institución. Las transacciones que importó previamente a su libro contable permanecen en sus registros, a menos que elija eliminarlas al desconectar o las elimine más tarde.
- **Solicitudes por correo electrónico:** También puede solicitar la eliminación o una copia de sus datos escribiéndonos a **tradelab.mantis@gmail.com**. Respondemos en un plazo de 30 días.

### 6.3 Cumplimiento de GDPR y CCPA
Si es residente del Espacio Económico Europeo (EEE) o de California, tiene derechos específicos con respecto a su información personal, incluido el derecho a acceder, corregir o eliminar sus datos.

## 7. Cookies y seguimiento
Utilizamos cookies esenciales para mantener su sesión y preferencias. No utilizamos cookies de seguimiento de terceros para fines publicitarios.

## 8. Privacidad de los niños
Nuestro servicio no está destinado a niños menores de 13 años. No recopilamos a sabiendas información personal de niños.

## 9. Cambios en esta política
Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la "Fecha de entrada en vigor".

## 10. Contáctenos
Si tiene alguna pregunta sobre esta Política de Privacidad o nuestras prácticas de datos, contáctenos en: **tradelab.mantis@gmail.com**
`;

export const PRIVACY_POLICY_PT = `
# Política de Privacidade

**Data de vigência: 16 de outubro de 2026**

## 1. Introdução
Esta Política de Privacidade descreve como o LedgerAI (o "Serviço") coleta, usa e divulga suas informações pessoais quando você usa nossos serviços. Estamos comprometidos em proteger sua privacidade e garantir a segurança de seus dados financeiros. Ao usar nosso serviço, você concorda com a coleta e o uso de informações de acordo com esta política.

## 2. Informações que Coletamos
### 2.1 Dados Financeiros via Plaid
Usamos a Plaid, Inc. ("Plaid") para conectar suas contas bancárias. Ao usar nosso serviço, você nos concede e à Plaid o direito, o poder e a autoridade para agir em seu nome para acessar e transmitir suas informações pessoais e financeiras da instituição financeira relevante.
- **Identificadores de Conta:** Nome, tipo de conta e números parciais de conta.
- **Histórico de Transações:** Datas, valores e descrições de transações dos últimos 24 meses.
- **Saldos:** Saldos de conta em tempo real para fornecer instantâneos financeiros precisos.

### 2.2 Informações Fornecidas pelo Usuário
- **Detalhes da Conta:** Nome, endereço de e-mail e preferências de perfil.
- **Comunicação:** Registros de qualquer correspondência com nossa equipe de suporte.
- **Conteúdo do Usuário:** Quaisquer notas, categorias ou dados personalizados que você insira manualmente no aplicativo.

### 2.3 Informações Coletadas Automaticamente
- **Dados de Uso:** Informações sobre como você interage com o aplicativo, incluindo recursos usados e tempo gasto.
- **Informações do Dispositivo:** Endereço IP, tipo de navegador e sistema operacional para fins de segurança e opimização.

## 3. Como Usamos Suas Informações
- **Análise com IA:** Os dados financeiros do usuário são processados pela IA do Google Gemini para categorização e geração de insights. Os dados não são usados pelo Google para treinar modelos de base para outros usuários. **Seus dados são processados com segurança e não são usados para treinar modelos de IA públicos.**
- **Prestação de Serviço:** Para manter sua conta e fornecer os recursos principais do rastreador de despesas.
- **Melhoria do Serviço:** Para analisar tendências de uso e melhorar a funcionalidade do aplicativo.
- **Segurança e Conformidade:** Para detectar e prevenir fraudes, acesso não autorizado e cumprir obrigações legais.

## 4. Segurança e Criptografia de Dados
Protegemos seus dados com as seguintes salvaguardas:
- **Criptografia em Trânsito:** Toda a comunicação entre o aplicativo, nossos servidores e nossos provedores de serviços usa TLS 1.2 ou superior.
- **Criptografia em Repouso:** Nosso banco de dados, hospedado pela Supabase, é criptografado em repouso com AES-256. Os tokens de acesso bancário são criptografados adicionalmente pelo nosso aplicativo antes de serem armazenados e nunca são enviados ao seu dispositivo.
- **Segurança da Conta:** As senhas são armazenadas apenas como hashes bcrypt com salt, nunca em formato legível. As tentativas de login têm limite de taxa para bloquear ataques de adivinhação de senha.
- **Isolamento de Dados:** Cada solicitação de dados financeiros é verificada em relação à conta conectada, de modo que cada usuário só pode acessar seus próprios dados.
- **Controle de Acesso:** O acesso aos sistemas de produção é limitado a pessoal autorizado com base no princípio do menor privilégio e exige autenticação multifator.

## 5. Compartilhamento de Dados e Terceiros
Não vendemos suas informações pessoais. Compartilhamos dados apenas com:
- **Plaid:** Para facilitar a conectividade bancária.
- **Supabase:** Para hospedagem do banco de dados.
- **Google Cloud:** Para hospedagem do aplicativo e processamento de IA (Google Gemini).
- **Parceiros de Publicidade:** Como o Nível Gratuito é suportado por anúncios, podemos compartilhar identificadores de dispositivos anônimos com parceiros de publicidade (como o Google AdMob) para exibir anúncios não personalizados para usuários no Nível Gratuito.
- **Autoridades Legais:** Quando exigido por lei ou para proteger nossos direitos legais, propriedade ou segurança.

## 6. Seus Direitos e Exclusão de Dados
### 6.1 Direito de Acesso e Portabilidade
Você tem o direito de solicitar uma cópia dos dados pessoais que mantemos sobre você em um formato estruturado e legível por máquina.

### 6.2 Direito ao Esquecimento
Você tem o direito de solicitar a exclusão de seus dados pessoais a qualquer momento.
- **Exclusão da Conta:** Quando você exclui sua conta, os detalhes da sua conta, seu livro-razão e seus dados bancários são excluídos imediata e permanentemente do nosso banco de dados de produção, e nosso acesso aos seus bancos vinculados é revogado junto à Plaid. Cópias residuais em backups criptografados do banco de dados expiram automaticamente em até 30 dias.
- **Desconexão Bancária:** Quando você desconecta um banco, revogamos nosso acesso junto à Plaid e excluímos imediatamente as contas, saldos e transações que obtivemos dessa instituição. As transações que você importou anteriormente para o seu livro-razão permanecem em seus registros, a menos que você opte por removê-las ao desconectar ou as exclua posteriormente.
- **Solicitações por E-mail:** Você também pode solicitar a exclusão ou uma cópia dos seus dados enviando um e-mail para **tradelab.mantis@gmail.com**. Respondemos em até 30 dias.

### 6.3 Conformidade com GDPR e CCPA
Se você for residente do Espaço Econômico Europeu (EEE) ou da Califórnia, terá direitos específicos em relação às suas informações pessoais, incluindo o direito de acessar, corrigir ou excluir seus dados.

## 7. Cookies e Rastreamento
Usamos cookies essenciais para manter sua sessão e preferências. Não usamos cookies de rastreamento de terceiros para fins publicitários.

## 8. Privacidade de Crianças
Nosso serviço não se destina ao uso por crianças menores de 13 anos. Não coletamos intencionalmente informações pessoais de crianças.

## 9. Alterações nesta Política
Podemos atualizar nossa Política de Privacidade de tempos em tempos. Iremos notificá-lo de quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a "Data de Vigência".

## 10. Contate-nos
Se você tiver alguma dúvida sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato conosco em: **tradelab.mantis@gmail.com**
`;

export const TERMS_OF_SERVICE = `
# Terms of Service

**Effective Date: March 18, 2026**

## 1. Acceptance of Terms
By accessing or using our application, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must not access or use the service.

## 2. Description of Service
We provide an AI-powered expense tracking and financial management tool. The service includes bank connectivity, transaction categorization, and financial reporting. We reserve the right to modify or discontinue the service at any time. **The Service relies on third-party providers (Plaid, Supabase, Google Cloud, Google Maps). LedgerAI is not liable for service interruptions, data inaccuracies, or downtime caused by these external providers.**

## 3. Financial Disclaimer
**IMPORTANT: WE ARE NOT FINANCIAL ADVISORS.**
- **Informational Purposes Only:** The insights, reports, and analysis provided by this application are for informational and educational purposes only.
- **No Professional Advice:** Nothing in this application constitutes professional financial, investment, legal, or tax advice.
- **User Responsibility:** You are solely responsible for your financial decisions. We recommend consulting with a qualified professional before making significant financial changes.

## 4. User Accounts
- **Registration:** You must provide accurate and complete information when creating an account.
- **Security:** You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
- **Unauthorized Use:** You must notify us immediately of any unauthorized use of your account.

## 5. Prohibited Conduct
You agree not to:
- Use the service for any illegal or unauthorized purpose.
- Attempt to hack, destabilize, or interfere with the service's infrastructure.
- Use automated systems (bots, scrapers) to access the service without permission.
- Impersonate any person or entity.

## 6. Intellectual Property
All content, features, and functionality of the service, including but not limited to software, design, and branding, are the exclusive property of our company and are protected by international copyright and trademark laws.

## 7. Limitation of Liability
To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or use, resulting from your use of the service. Our total liability shall not exceed the amount paid by you for the service in the past 12 months.

## 8. Indemnification
You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the service or violation of these Terms.

## 9. Termination
We reserve the right to terminate or suspend your access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.

## 10. Subscription & Refunds
All subscriptions and payments for Premium (CA$19.51) and Enterprise (CA$65.06) tiers are processed via the Apple App Store or Google Play Store. Refunds are subject to the policies of the respective app store provider.

## 11. Governing Law and Dispute Resolution
These Terms shall be governed by the laws of the Province of Ontario and the federal laws of Canada. Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the local arbitration association.

## 12. Changes to Terms
We reserve the right to modify these Terms at any time. Your continued use of the service after such changes constitutes your acceptance of the new Terms.

## 13. Contact
For any questions regarding these Terms, please contact **tradelab.mantis@gmail.com**
`;

export const TERMS_OF_SERVICE_FR = `
# Conditions d'utilisation

**Date d'entrée en vigueur : 18 mars 2026**

## 1. Acceptation des conditions
En accédant à notre application ou en l'utilisant, vous acceptez d'être lié par ces conditions d'utilisation et notre politique de confidentialité. Si vous n'acceptez pas ces conditions, vous ne devez pas accéder au service ni l'utiliser.

## 2. Description du service
Nous fournissons un outil de suivi des dépenses et de gestion financière alimenté par l'IA. Le service comprend la connectivité bancaire, la catégorisation des transactions et les rapports financiers. Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment. **Le Service s'appuie sur des prestataires tiers (Plaid, Supabase, Google Cloud, Google Maps). LedgerAI n'est pas responsable des interruptions de service, des inexactitudes de données ou des temps d'arrêt causés par des prestataires externes.**

## 3. Avis de non-responsabilité financière
**IMPORTANT : NOUS NE SOMMES PAS DES CONSEILLERS FINANCIERS.**
- **À des fins d'information uniquement :** Les informations, rapports et analyses fournis par cette application sont uniquement à des fins d'information et d'éducation.
- **Aucun conseil professionnel :** Rien dans cette application ne constitue un conseil professionnel financier, d'investissement, juridique ou fiscal.
- **Responsabilité de l'utilisateur :** Vous êtes seul responsable de vos décisions financières. Nous vous recommandons de consulter un professionnel qualifié avant d'apporter des changements financiers importants.

## 4. Comptes d'utilisateurs
- **Inscription :** Vous devez fournir des informations exactes et complètes lors de la création d'un compte.
- **Sécurité :** Vous êtes responsable du maintien de la confidentialité des identifiants de votre compte et de toutes les activités qui se déroulent sous votre compte.
- **Utilisation non autorisée :** Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte.

## 5. Conduite interdite
Vous acceptez de ne pas :
- Utiliser le service à des fins illégales ou non autorisées.
- Tenter de pirater, de déstabiliser ou d'interférer avec l'infrastructure du service.
- Utiliser des systèmes automatisés (bots, scrapers) pour accéder au service sans autorisation.
- Usurper l'identité de toute personne ou entité.

## 6. Propriété intellectuelle
Tout le contenu, les caractéristiques et les fonctionnalités du service, y compris, mais sans s'y limiter, le logiciel, la conception et l'image de marque, sont la propriété exclusive de notre société et sont protégés par les lois internationales sur le droit d'auteur et les marques.

## 7. Limitation de responsabilité
Dans la mesure maximale permise par la loi, nous ne serons pas responsables des dommages indirects, accessoires, spéciaux ou consécutifs, y compris la perte de profits, de données ou d'utilisation, résultant de votre utilisation du service. Notre responsabilité totale ne dépassera pas le montant payé par vous pour le service au cours des 12 derniers mois.

## 8. Indemnisation
Vous acceptez d'indemniser et de nous dégager de toute responsabilité en cas de réclamations, dommages ou dépenses découlant de votre utilisation du service ou de la violation de ces conditions.

## 9. Résiliation
Nous nous réservons le droit de résilier ou de suspendre votre accès au service à notre seule discrétion, sans préavis, pour une conduite que nous estimons violer ces conditions ou être préjudiciable à d'autres utilisateurs ou à nos intérêts commerciaux.

## 10. Abonnement et remboursements
Tous les abonnements et paiements pour les niveaux Premium (19,51 CA$) et Enterprise (65,06 CA$) sont traités via l'App Store d'Apple ou le Google Play Store. Les remboursements sont soumis aux politiques du fournisseur d'App Store respectif.

## 11. Loi applicable et résolution des litiges
Ces conditions sont régies par les lois de la province de l'Ontario et les lois fédérales du Canada. Tout litige découlant de ces conditions sera résolu par un arbitrage exécutoire conformément aux règles de l'association d'arbitrage locale.

## 12. Modifications des conditions
Nous nous réservons le droit de modifier ces conditions à tout moment. Votre utilisation continue du service après de tels changements constitue votre acceptation des nouvelles conditions.

## 13. Contact
Pour toute question concernant ces conditions, veuillez contacter **tradelab.mantis@gmail.com**
`;

export const TERMS_OF_SERVICE_ES = `
# Términos de Servicio

**Fecha de entrada en vigor: 18 de marzo de 2026**

## 1. Aceptación de los Términos
Al acceder o utilizar nuestra aplicación, usted acepta estar sujeto a estos Términos de Servicio y nuestra Política de Privacidad. Si no está de acuerdo con estos términos, no debe acceder ni utilizar el servicio.

## 2. Descripción del Servicio
Proporcionamos una herramienta de gestión financiera y seguimiento de gastos impulsada por IA. El servicio incluye conectividad bancaria, categorización de transacciones e informes financieros. Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento. **El Servicio depende de proveedores externos (Plaid, Supabase, Google Cloud, Google Maps). LedgerAI no es responsable de las interrupciones del servicio, las inexactitudes de los datos o el tiempo de inactividad causado por estos proveedores externos.**

## 3. Descargo de responsabilidad financiera
**IMPORTANTE: NO SOMOS ASESORES FINANCIEROS.**
- **Solo con fines informativos:** Los conocimientos, informes y análisis proporcionados por esta aplicación son solo con fines informativos y educativos.
- **Sin asesoramiento profesional:** Nada en esta aplicación constituye asesoramiento profesional financiero, de inversión, legal o fiscal.
- **Responsabilidad del usuario:** Usted es el único responsable de sus decisiones financieras. Recomendamos consultar con un profesional calificado antes de realizar cambios financieros significativos.

## 4. Cuentas de usuario
- **Registro:** Debe proporcionar información precisa y completa al crear una cuenta.
- **Seguridad:** Usted es responsable de mantener la confidencialidad de las credenciales de su cuenta y de todas las actividades que ocurran bajo su cuenta.
- **Uso no autorizado:** Debe notificarnos de inmediato sobre cualquier uso no autorizado de su cuenta.

## 5. Conducta prohibida
Usted acepta no:
- Utilizar el servicio para cualquier propósito ilegal o no autorizado.
- Intentar piratear, desestabilizar o interferir con la infraestructura del servicio.
- Utilizar sistemas automatizados (bots, scrapers) para acceder al servicio sin permiso.
- Suplantar a cualquier persona o entidad.

## 6. Propiedad Intelectual
Todo el contenido, las características y la funcionalidad del servicio, incluidos, entre otros, el software, el diseño y la marca, son propiedad exclusiva de nuestra empresa y están protegidos por las leyes internacionales de derechos de autor y marcas registradas.

## 7. Limitación de responsabilidad
En la medida máxima permitida por la ley, no seremos responsables de ningún daño indirecto, incidental, especial o consecuente, incluida la pérdida de ganancias, datos o uso, que resulte de su uso del servicio. Nuestra responsabilidad total no excederá el monto pagado por usted por el servicio en los últimos 12 meses.

## 8. Indemnización
Usted acepta indemnizarnos y eximirnos de responsabilidad por cualquier reclamo, daño o gasto que surja de su uso del servicio o la violación de estos Términos.

## 9. Terminación
Nos reservamos el derecho de terminar o suspender su acceso al servicio a nuestra entera discreción, sin previo aviso, por una conducta que creamos que viola estos Términos o que sea perjudicial para otros usuarios o nuestros intereses comerciales.

## 10. Suscripción y reembolsos
Todas las suscripciones y pagos para los niveles Premium (CA$19.51) y Enterprise (CA$65.06) se procesan a través de Apple App Store o Google Play Store. Los reembolsos están sujetos a las políticas del proveedor de la tienda de aplicaciones correspondiente.

## 11. Ley aplicable y resolución de disputas
Estos Términos se regirán por las leyes de la Provincia de Ontario y las leyes federales de Canadá. Cualquier disputa que surja de estos Términos se resolverá mediante arbitraje vinculante de acuerdo con las reglas de la asociación de arbitraje local.

## 12. Cambios en los Términos
Nos reservamos el derecho de modificar estos Términos en cualquier momento. Su uso continuado del servicio después de dichos cambios constituye su aceptación de los nuevos Términos.

## 13. Contacto
Para cualquier pregunta con respecto a estos Términos, comuníquese con **tradelab.mantis@gmail.com**
`;

export const TERMS_OF_SERVICE_PT = `
# Termos de Serviço

**Data de vigência: 18 de março de 2026**

## 1. Aceitação dos Termos
Ao acessar ou usar nosso aplicativo, você concorda em cumprir estes Termos de Serviço e nossa Política de Privacidade. Se você não concordar com estes termos, não deverá acessar ou usar o serviço.

## 2. Descrição do Serviço
Fornecemos uma ferramenta de gerenciamento financeiro e rastreamento de despesas com tecnologia de IA. O serviço inclui conectividade bancária, categorização de transações e relatórios financeiros. Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento. **O Serviço depende de provedores terceirizados (Plaid, Supabase, Google Cloud, Google Maps). O LedgerAI não é responsável por interrupções de serviço, imprecisões de dados ou tempo de inatividade causado por esses provedores externos.**

## 3. Isenção de Responsabilidade Financeira
**IMPORTANTE: NÃO SOMOS CONSULTORES FINANCEIROS.**
- **Apenas para Fins Informativos:** Os insights, relatórios e análises fornecidos por este aplicativo são apenas para fins informativos e educacionais.
- **Sem Aconselhamento Profissional:** Nada neste aplicativo constitui aconselhamento profissional financeiro, de investimento, jurídico ou tributário.
- **Responsabilidade do Usuário:** Você é o único responsável por suas decisões financeiras. Recomendamos consultar um profissional qualificado antes de fazer mudanças financeiras significativas.

## 4. Contas de Usuário
- **Registro:** Você deve fornecer informações precisas e completas ao criar uma conta.
- **Segurança:** Você é responsável por manter a confidencialidade das credenciais de sua conta e por todas as atividades que ocorrem em sua conta.
- **Uso Não Autorizado:** Você deve nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.

## 5. Conduta Proibida
Você concorda em não:
- Usar o serviço para qualquer finalidade ilegal ou não autorizada.
- Tentar hackear, desestabilizar ou interferir na infraestrutura do serviço.
- Usar sistemas automatizados (bots, scrapers) para acessar o serviço sem permissão.
- Personificar qualquer pessoa ou entidade.

## 6. Propriedade Intelectual
Todo o conteúdo, recursos e funcionalidades do serviço, incluindo, entre outros, software, design e marca, são de propriedade exclusiva de nossa empresa e são protegidos por leis internacionais de direitos autorais e marcas registradas.

## 7. Limitação de Responsabilidade
Na extensão máxima permitida por lei, não seremos responsáveis por quaisquer danos indiretos, incidentais, especiais ou consequenciais, incluindo perda de lucros, dados ou uso, resultantes do seu uso do serviço. Nossa responsabilidade total não excederá o valor pago por você pelo serviço nos últimos 12 meses.

## 8. Indenização
Você concorda em nos indenizar e isentar de quaisquer reivindicações, danos ou despesas decorrentes do seu uso do serviço ou violação destes Termos.

## 9. Rescisão
Reservamo-nos o direito de encerrar ou suspender seu acesso ao serviço a nosso exclusivo critério, sem aviso prévio, por conduta que acreditamos violar estes Termos ou ser prejudicial a outros usuários ou aos nossos interesses comerciais.

## 10. Assinatura e Reembolsos
Todas as assinaturas e pagamentos para os níveis Premium (CA$ 19,51) e Enterprise (CA$ 65,06) são processados pela Apple App Store ou Google Play Store. Os reembolsos estão sujeitos às políticas do respectivo provedor da loja de aplicativos.

## 11. Lei Aplicável e Resolução de Disputas
Estes Termos serão regidos pelas leis da Província de Ontário e pelas leis federais do Canadá. Quaisquer disputas decorrentes destes Termos serão resolvidas por meio de arbitragem vinculativa de acordo com as regras da associação de arbitragem local.

## 12. Alterações nos Termos
Reservamo-nos o direito de modificar estes Termos a qualquer momento. Seu uso continuado do serviço após tais alterações constitui sua aceitação dos novos Termos.

## 13. Contato
Para qualquer dúvida sobre estes Termos, entre em contato com **tradelab.mantis@gmail.com**
`;

export const DATA_RETENTION_POLICY = `
# Data Retention & Security Policy

**Effective Date: October 16, 2026**

## 1. Overview
This policy explains what data LedgerAI keeps, how long we keep it and how it is deleted. It applies to all personal and financial data we process, including data received through Plaid. We review this policy at least once a year and whenever our data practices change.

## 2. Retention Principles
- **Data Minimization:** We request only the Plaid products needed for LedgerAI's features (Transactions, Identity and Balance).
- **Purpose Limitation:** Data is used only to provide the Service as described in our Privacy Policy.
- **Storage Limitation:** We keep data only while your account is active, or for as long as the law requires.

## 3. Retention Periods
- **Account and Ledger Data:** Kept while your account is active.
- **Bank Data from Plaid** (accounts, balances, transactions and access tokens): Kept until you disconnect that bank or delete your account.
- **Server Logs:** Kept for up to 30 days for security and troubleshooting.
- **Database Backups:** Encrypted, and expire automatically within 30 days.

## 4. Deletion
- **Account Deletion:** You can delete your account from the app or by emailing **tradelab.mantis@gmail.com**. Your account, ledger and bank data are permanently deleted from our production database immediately, and our access to your linked banks is revoked with Plaid. Copies in encrypted backups expire within 30 days.
- **Bank Disconnection:** Disconnecting a bank revokes our access with Plaid and immediately deletes the accounts, balances and transactions retrieved from it. You can choose to also remove the transactions you imported into your ledger from that bank.
- **Data on Your Device:** LedgerAI keeps a working copy of your ledger on your device so it works offline. Uninstalling the app removes this copy.

## 5. Security Controls
- **Encryption:** TLS 1.2 or higher in transit; AES-256 at rest in our database. Bank access tokens are additionally encrypted by our application.
- **Access Control:** Least-privilege access to production systems, with multi-factor authentication required for all administrative access to our database, hosting and source code.
- **Vulnerability Management:** Automated dependency and code scanning, with identified vulnerabilities fixed within defined timelines based on severity.
- **Incident Response:** We maintain an incident response plan covering identification, containment, eradication and recovery. If a breach affects your data, we will notify you and the relevant authorities as required by applicable law.

## 6. Data Disposal
Deleted data is permanently removed from our production database, not just hidden or marked as deleted.
`;

export const DATA_RETENTION_POLICY_FR = `
# Politique de conservation et de sécurité des données

**Date d'entrée en vigueur : 16 octobre 2026**

## 1. Aperçu
Cette politique explique quelles données LedgerAI conserve, combien de temps nous les conservons et comment elles sont supprimées. Elle s'applique à toutes les données personnelles et financières que nous traitons, y compris les données reçues via Plaid. Nous révisons cette politique au moins une fois par an et chaque fois que nos pratiques en matière de données changent.

## 2. Principes de conservation
- **Minimisation des données :** Nous ne demandons que les produits Plaid nécessaires aux fonctionnalités de LedgerAI (Transactions, Identité et Solde).
- **Limitation des finalités :** Les données sont utilisées uniquement pour fournir le Service tel que décrit dans notre Politique de confidentialité.
- **Limitation de la conservation :** Nous conservons les données uniquement tant que votre compte est actif, ou aussi longtemps que la loi l'exige.

## 3. Périodes de conservation
- **Données du compte et du registre :** Conservées tant que votre compte est actif.
- **Données bancaires provenant de Plaid** (comptes, soldes, transactions et jetons d'accès) : Conservées jusqu'à ce que vous déconnectiez cette banque ou supprimiez votre compte.
- **Journaux du serveur :** Conservés jusqu'à 30 jours à des fins de sécurité et de dépannage.
- **Sauvegardes de la base de données :** Cryptées, elles expirent automatiquement dans un délai de 30 jours.

## 4. Suppression
- **Suppression du compte :** Vous pouvez supprimer votre compte depuis l'application ou en écrivant à **tradelab.mantis@gmail.com**. Votre compte, votre registre et vos données bancaires sont immédiatement et définitivement supprimés de notre base de données de production, et notre accès à vos banques liées est révoqué auprès de Plaid. Les copies dans les sauvegardes cryptées expirent dans un délai de 30 jours.
- **Déconnexion bancaire :** La déconnexion d'une banque révoque notre accès auprès de Plaid et supprime immédiatement les comptes, soldes et transactions récupérés auprès de celle-ci. Vous pouvez également choisir de supprimer les transactions que vous avez importées dans votre registre depuis cette banque.
- **Données sur votre appareil :** LedgerAI conserve une copie de travail de votre registre sur votre appareil afin de fonctionner hors ligne. La désinstallation de l'application supprime cette copie.

## 5. Contrôles de sécurité
- **Cryptage :** TLS 1.2 ou supérieur en transit ; AES-256 au repos dans notre base de données. Les jetons d'accès bancaires sont en outre cryptés par notre application.
- **Contrôle d'accès :** Accès aux systèmes de production selon le principe du moindre privilège, avec authentification multifacteur obligatoire pour tout accès administratif à notre base de données, à notre hébergement et à notre code source.
- **Gestion des vulnérabilités :** Analyse automatisée des dépendances et du code, les vulnérabilités identifiées étant corrigées dans des délais définis selon leur gravité.
- **Réponse aux incidents :** Nous maintenons un plan de réponse aux incidents couvrant l'identification, le confinement, l'éradication et la récupération. Si une violation affecte vos données, nous vous en informerons, ainsi que les autorités compétentes, conformément à la loi applicable.

## 6. Élimination des données
Les données supprimées sont définitivement retirées de notre base de données de production, et non simplement masquées ou marquées comme supprimées.
`;

export const DATA_RETENTION_POLICY_ES = `
# Política de retención y seguridad de datos

**Fecha de entrada en vigor: 16 de octubre de 2026**

## 1. Resumen
Esta política explica qué datos conserva LedgerAI, durante cuánto tiempo los conservamos y cómo se eliminan. Se aplica a todos los datos personales y financieros que procesamos, incluidos los datos recibidos a través de Plaid. Revisamos esta política al menos una vez al año y siempre que cambien nuestras prácticas de datos.

## 2. Principios de retención
- **Minimización de datos:** Solo solicitamos los productos de Plaid necesarios para las funciones de LedgerAI (Transacciones, Identidad y Saldo).
- **Limitación de la finalidad:** Los datos se utilizan únicamente para prestar el Servicio tal como se describe en nuestra Política de Privacidad.
- **Limitación del almacenamiento:** Conservamos los datos solo mientras su cuenta esté activa, o durante el tiempo que exija la ley.

## 3. Períodos de retención
- **Datos de la cuenta y del libro contable:** Se conservan mientras su cuenta esté activa.
- **Datos bancarios de Plaid** (cuentas, saldos, transacciones y tokens de acceso): Se conservan hasta que desconecte ese banco o elimine su cuenta.
- **Registros del servidor:** Se conservan hasta 30 días con fines de seguridad y resolución de problemas.
- **Copias de seguridad de la base de datos:** Están cifradas y caducan automáticamente en un plazo de 30 días.

## 4. Eliminación
- **Eliminación de la cuenta:** Puede eliminar su cuenta desde la aplicación o escribiendo a **tradelab.mantis@gmail.com**. Su cuenta, su libro contable y sus datos bancarios se eliminan de forma inmediata y permanente de nuestra base de datos de producción, y nuestro acceso a sus bancos vinculados se revoca ante Plaid. Las copias en las copias de seguridad cifradas caducan en un plazo de 30 días.
- **Desconexión bancaria:** Desconectar un banco revoca nuestro acceso ante Plaid y elimina de inmediato las cuentas, saldos y transacciones obtenidos de él. También puede optar por eliminar las transacciones que importó a su libro contable desde ese banco.
- **Datos en su dispositivo:** LedgerAI guarda una copia de trabajo de su libro contable en su dispositivo para que funcione sin conexión. Desinstalar la aplicación elimina esta copia.

## 5. Controles de seguridad
- **Cifrado:** TLS 1.2 o superior en tránsito; AES-256 en reposo en nuestra base de datos. Los tokens de acceso bancario se cifran además en nuestra aplicación.
- **Control de acceso:** Acceso a los sistemas de producción según el principio de menor privilegio, con autenticación multifactor obligatoria para todo acceso administrativo a nuestra base de datos, alojamiento y código fuente.
- **Gestión de vulnerabilidades:** Análisis automatizado de dependencias y de código, y corrección de las vulnerabilidades identificadas dentro de plazos definidos según su gravedad.
- **Respuesta a incidentes:** Mantenemos un plan de respuesta a incidentes que abarca la identificación, la contención, la erradicación y la recuperación. Si una violación afecta a sus datos, se lo notificaremos a usted y a las autoridades competentes según lo exija la ley aplicable.

## 6. Eliminación segura de datos
Los datos eliminados se borran de forma permanente de nuestra base de datos de producción; no solo se ocultan ni se marcan como eliminados.
`;

export const DATA_RETENTION_POLICY_PT = `
# Política de Retenção e Segurança de Dados

**Data de vigência: 16 de outubro de 2026**

## 1. Visão Geral
Esta política explica quais dados o LedgerAI mantém, por quanto tempo os mantemos e como são excluídos. Ela se aplica a todos os dados pessoais e financeiros que processamos, incluindo os dados recebidos por meio da Plaid. Revisamos esta política pelo menos uma vez por ano e sempre que nossas práticas de dados mudarem.

## 2. Princípios de Retenção
- **Minimização de Dados:** Solicitamos apenas os produtos da Plaid necessários para os recursos do LedgerAI (Transações, Identidade e Saldo).
- **Limitação de Finalidade:** Os dados são usados apenas para fornecer o Serviço conforme descrito em nossa Política de Privacidade.
- **Limitação de Armazenamento:** Mantemos os dados apenas enquanto sua conta estiver ativa, ou pelo tempo exigido por lei.

## 3. Períodos de Retenção
- **Dados da Conta e do Livro-Razão:** Mantidos enquanto sua conta estiver ativa.
- **Dados Bancários da Plaid** (contas, saldos, transações e tokens de acesso): Mantidos até que você desconecte esse banco ou exclua sua conta.
- **Logs do Servidor:** Mantidos por até 30 dias para fins de segurança e solução de problemas.
- **Backups do Banco de Dados:** Criptografados e expiram automaticamente em até 30 dias.

## 4. Exclusão
- **Exclusão da Conta:** Você pode excluir sua conta pelo aplicativo ou enviando um e-mail para **tradelab.mantis@gmail.com**. Sua conta, seu livro-razão e seus dados bancários são excluídos imediata e permanentemente do nosso banco de dados de produção, e nosso acesso aos seus bancos vinculados é revogado junto à Plaid. As cópias em backups criptografados expiram em até 30 dias.
- **Desconexão Bancária:** Desconectar um banco revoga nosso acesso junto à Plaid e exclui imediatamente as contas, saldos e transações obtidos dele. Você também pode optar por remover as transações que importou para o seu livro-razão a partir desse banco.
- **Dados no Seu Dispositivo:** O LedgerAI mantém uma cópia de trabalho do seu livro-razão no seu dispositivo para funcionar offline. Desinstalar o aplicativo remove essa cópia.

## 5. Controles de Segurança
- **Criptografia:** TLS 1.2 ou superior em trânsito; AES-256 em repouso em nosso banco de dados. Os tokens de acesso bancário são criptografados adicionalmente pelo nosso aplicativo.
- **Controle de Acesso:** Acesso aos sistemas de produção com base no menor privilégio, com autenticação multifator obrigatória para todo acesso administrativo ao nosso banco de dados, hospedagem e código-fonte.
- **Gestão de Vulnerabilidades:** Varredura automatizada de dependências e de código, com as vulnerabilidades identificadas corrigidas dentro de prazos definidos conforme a gravidade.
- **Resposta a Incidentes:** Mantemos um plano de resposta a incidentes que abrange identificação, contenção, erradicação e recuperação. Se uma violação afetar seus dados, notificaremos você e as autoridades competentes conforme exigido pela legislação aplicável.

## 6. Descarte de Dados
Os dados excluídos são removidos permanentemente do nosso banco de dados de produção, e não apenas ocultados ou marcados como excluídos.
`;

export const PRIVACY_POLICY_HI = `
# गोपनीयता नीति

**प्रभावी तिथि: 16 अक्टूबर, 2026**

## 1. परिचय
यह गोपनीयता नीति बताती है कि जब आप हमारी सेवाओं का उपयोग करते हैं तो LedgerAI ("सेवा") आपकी व्यक्तिगत जानकारी कैसे एकत्र, उपयोग और प्रकट करती है। हम आपकी गोपनीयता की रक्षा करने और आपके वित्तीय डेटा की सुरक्षा सुनिश्चित करने के लिए प्रतिबद्ध हैं। हमारी सेवा का उपयोग करके, आप इस नीति के अनुसार जानकारी के संग्रह और उपयोग के लिए सहमत होते हैं।

## 2. जानकारी जो हम एकत्र करते हैं
### 2.1 प्लैड के माध्यम से वित्तीय डेटा
हम आपके बैंक खातों को जोड़ने के लिए Plaid, Inc. ("Plaid") का उपयोग करते हैं। हमारी सेवा का उपयोग करके, आप हमें और प्लैड को संबंधित वित्तीय संस्थान से आपकी व्यक्तिगत और वित्तीय जानकारी तक पहुँचने और प्रसारित करने के लिए आपकी ओर से कार्य करने का अधिकार, शक्ति और अधिकार प्रदान करते हैं।
- **खाता पहचानकर्ता:** नाम, खाते का प्रकार, और आंशिक खाता संख्या।
- **लेनदेन इतिहास:** पिछले 24 महीनों के लिए लेनदेन की तारीखें, राशियाँ और विवरण।
- **शेष राशि:** सटीक वित्तीय स्नैपशॉट प्रदान करने के लिए रीयल-टाइम खाता शेष।

### 2.2 उपयोगकर्ता द्वारा प्रदान की गई जानकारी
- **खाता विवरण:** नाम, ईमेल पता और प्रोफ़ाइल प्राथमिकताएं।
- **संचार:** हमारी सहायता टीम के साथ किसी भी पत्राचार का रिकॉर्ड।
- **उपयोगकर्ता सामग्री:** कोई भी नोट, श्रेणियां, या कस्टम डेटा जो आप मैन्युअल रूप से एप्लिकेशन में दर्ज करते हैं।

### 2.3 स्वचालित रूप से एकत्र की गई जानकारी
- **उपयोग डेटा:** आप एप्लिकेशन के साथ कैसे इंटरैक्ट करते हैं, इसकी जानकारी, जिसमें उपयोग की गई विशेषताएं और बिताया गया समय शामिल है।
- **डिवाइस की जानकारी:** सुरक्षा और अनुकूलन उद्देश्यों के लिए आईपी पता, ब्राउज़र प्रकार और ऑपरेटिंग सिस्टम।

## 3. हम आपकी जानकारी का उपयोग कैसे करते हैं
- **AI-संचालित विश्लेषण:** उपयोगकर्ता वित्तीय डेटा को वर्गीकरण और अंतर्दृष्टि निर्माण के लिए Google Gemini AI द्वारा संसाधित किया जाता है। Google द्वारा अन्य उपयोगकर्ताओं के लिए फाउंडेशन मॉडल को प्रशिक्षित करने के लिए डेटा का उपयोग नहीं किया जाता है। **आपका डेटा सुरक्षित रूप से संसाधित किया जाता है और सार्वजनिक AI मॉडल को प्रशिक्षित करने के लिए उपयोग नहीं किया जाता है।**
- **सेवा वितरण:** अपना खाता बनाए रखने और व्यय ट्रैकर की मुख्य विशेषताएं प्रदान करने के लिए।
- **सेवा सुधार:** उपयोग के रुझानों का विश्लेषण करने और एप्लिकेशन की कार्यक्षमता में सुधार करने के लिए।
- **सुरक्षा और अनुपालन:** धोखाधड़ी, अनधिकृत पहुंच का पता लगाने और रोकने और कानूनी दायित्वों का पालन करने के लिए।

## 4. डेटा सुरक्षा और एन्क्रिप्शन
हम निम्नलिखित सुरक्षा उपायों से आपके डेटा की रक्षा करते हैं:
- **एन्क्रिप्शन इन ट्रांजिट:** एप्लिकेशन, हमारे सर्वर और हमारे सेवा प्रदाताओं के बीच सभी संचार टीएलएस 1.2 या उच्चतर का उपयोग करते हैं।
- **एन्क्रिप्शन एट रेस्ट:** Supabase द्वारा होस्ट किया गया हमारा डेटाबेस एईएस-256 के साथ एट रेस्ट एन्क्रिप्टेड है। बैंक एक्सेस टोकन को संग्रहीत करने से पहले हमारे एप्लिकेशन द्वारा अतिरिक्त रूप से एन्क्रिप्ट किया जाता है, और उन्हें कभी भी आपके डिवाइस पर नहीं भेजा जाता है।
- **खाता सुरक्षा:** पासवर्ड केवल सॉल्टेड bcrypt हैश के रूप में संग्रहीत किए जाते हैं, कभी भी पढ़ने योग्य रूप में नहीं। पासवर्ड-अनुमान हमलों को रोकने के लिए लॉगिन प्रयासों की दर सीमित है।
- **डेटा पृथक्करण:** वित्तीय डेटा के प्रत्येक अनुरोध की जाँच साइन-इन किए गए खाते के विरुद्ध की जाती है, ताकि प्रत्येक उपयोगकर्ता केवल अपने स्वयं के डेटा तक पहुँच सके।
- **पहुंच नियंत्रण:** उत्पादन सिस्टम तक पहुंच न्यूनतम विशेषाधिकार के आधार पर केवल अधिकृत कर्मियों तक सीमित है और इसके लिए मल्टी-फैक्टर ऑथेंटिकेशन आवश्यक है।

## 5. डेटा साझाकरण और तृतीय पक्ष
हम आपकी व्यक्तिगत जानकारी नहीं बेचते हैं। हम डेटा केवल इनके साथ साझा करते हैं:
- **प्लैड:** बैंक कनेक्टिविटी की सुविधा के लिए।
- **Supabase:** डेटाबेस होस्टिंग के लिए।
- **Google क्लाउड:** एप्लिकेशन होस्टिंग और AI प्रसंस्करण (Google Gemini) के लिए।
- **विज्ञापन भागीदार:** चूंकि फ्री टियर विज्ञापन-समर्थित है, इसलिए हम फ्री टियर के उपयोगकर्ताओं को गैर-व्यक्तिगत विज्ञापन दिखाने के लिए विज्ञापन भागीदारों (जैसे Google AdMob) के साथ अज्ञात डिवाइस पहचानकर्ता साझा कर सकते हैं।
- **कानूनी अधिकारी:** जब कानून द्वारा आवश्यक हो या हमारे कानूनी अधिकारों, संपत्ति या सुरक्षा की रक्षा के लिए।

## 6. आपके अधिकार और डेटा विलोपन
### 6.1 पहुंच और सुवाह्यता का अधिकार
आपको एक संरचित, मशीन-पठनीय प्रारूप में हमारे पास मौजूद आपके व्यक्तिगत डेटा की एक प्रति का अनुरोध करने का अधिकार है।

### 6.2 भूल जाने का अधिकार
आपको किसी भी समय अपने व्यक्तिगत डेटा को हटाने का अनुरोध करने का अधिकार है।
- **खाता हटाना:** जब आप अपना खाता हटाते हैं, तो आपके खाते का विवरण, लेजर और बैंक डेटा हमारे उत्पादन डेटाबेस से तुरंत और स्थायी रूप से हटा दिया जाता है, और आपके लिंक किए गए बैंकों तक हमारी पहुंच प्लैड के साथ रद्द कर दी जाती है। एन्क्रिप्टेड डेटाबेस बैकअप में बची प्रतियां 30 दिनों के भीतर स्वचालित रूप से समाप्त हो जाती हैं।
- **बैंक डिस्कनेक्शन:** जब आप किसी बैंक को डिस्कनेक्ट करते हैं, तो हम प्लैड के साथ अपनी पहुंच रद्द कर देते हैं और उस संस्थान से प्राप्त खातों, शेष राशियों और लेनदेन को तुरंत हटा देते हैं। आपके द्वारा पहले अपने लेजर में आयात किए गए लेनदेन आपके रिकॉर्ड में बने रहते हैं, जब तक कि आप डिस्कनेक्ट करते समय उन्हें हटाने का विकल्प न चुनें या बाद में उन्हें हटा न दें।
- **ईमेल द्वारा अनुरोध:** आप **tradelab.mantis@gmail.com** पर ईमेल करके अपने डेटा को हटाने या उसकी प्रति का अनुरोध भी कर सकते हैं। हम 30 दिनों के भीतर जवाब देते हैं।

### 6.3 GDPR और CCPA अनुपालन
यदि आप यूरोपीय आर्थिक क्षेत्र (EEA) या कैलिफ़ोर्निया के निवासी हैं, तो आपके पास अपनी व्यक्तिगत जानकारी के संबंध में विशिष्ट अधिकार हैं, जिसमें आपके डेटा तक पहुँचने, उसे सही करने या हटाने का अधिकार शामिल है।

## 7. कुकीज़ और ट्रैकिंग
हम आपके सत्र और प्राथमिकताओं को बनाए रखने के लिए आवश्यक कुकीज़ का उपयोग करते हैं। हम विज्ञापन उद्देश्यों के लिए तृतीय-पक्ष ट्रैकिंग कुकीज़ का उपयोग नहीं करते हैं।

## 8. बच्चों की गोपनीयता
हमारी सेवा 13 वर्ष से कम उम्र के बच्चों द्वारा उपयोग के लिए अभिप्रेत नहीं है। हम जानबूझकर बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं।

## 9. इस नीति में परिवर्तन
हम समय-समय पर अपनी गोपनीयता नीति को अपडेट कर सकते हैं। हम इस पृष्ठ पर नई गोपनीयता नीति पोस्ट करके और "प्रभावी तिथि" को अपडेट करके आपको किसी भी बदलाव के बारे में सूचित करेंगे।

## 10. हमसे संपर्क करें
यदि इस गोपनीयता नीति या हमारे डेटा प्रथाओं के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें: **tradelab.mantis@gmail.com**
`;

export const PRIVACY_POLICY_AR = `
# سياسة الخصوصية

**تاريخ النفاذ: 16 أكتوبر 2026**

## 1. مقدمة
تصف سياسة الخصوصية هذه كيف يقوم LedgerAI ("الخدمة") بجمع معلوماتك الشخصية واستخدامها والكشف عنها عند استخدام خدماتنا. نحن ملتزمون بحماية خصوصيتك وضمان أمن بياناتك المالية. باستخدام خدمتنا، فإنك توافق على جمع المعلومات واستخدامها وفقًا لهذه السياسة.

## 2. المعلومات التي نجمعها
### 2.1 البيانات المالية عبر Plaid
نحن نستخدم Plaid, Inc. ("Plaid") لربط حساباتك المصرفية. باستخدام خدمتنا، فإنك تمنحنا وتمنح Plaid الحق والقوة والسلطة للتصرف نيابة عنك للوصول إلى معلوماتك الشخصية والمالية ونقلها من المؤسسة المالية ذات الصلة.
- **معرفات الحساب:** الاسم، ونوع الحساب، وأرقام الحسابات الجزئية.
- **سجل المعاملات:** تواريخ المعاملات والمبالغ والأوصاف لآخر 24 شهرًا.
- **الأرصدة:** أرصدة الحسابات في الوقت الفعلي لتقديم لقطات مالية دقيقة.

### 2.2 المعلومات التي يقدمها المستخدم
- **تفاصيل الحساب:** الاسم وعنوان البريد الإلكتروني وتفضيلات الملف الشخصي.
- **التواصل:** سجلات أي مراسلات مع فريق الدعم لدينا.
- **محتوى المستخدم:** أي ملاحظات أو فئات أو بيانات مخصصة تدخلها يدويًا في التطبيق.

### 2.3 المعلومات التي يتم جمعها تلقائيًا
- **بيانات الاستخدام:** معلومات حول كيفية تفاعلك مع التطبيق، بما في ذلك الميزات المستخدمة والوقت المستغرق.
- **معلومات الجهاز:** عنوان IP ونوع المتصفح ونظام التشغيل لأغراض الأمن والتحسين.

## 3. كيف نستخدم معلوماتك
- **التحليل المدعوم بالذكاء الاصطناعي:** تتم معالجة البيانات المالية للمستخدم بواسطة Google Gemini AI لتصنيفها وتوليد الرؤى. لا تستخدم Google البيانات لتدريب النماذج الأساسية للمستخدمين الآخرين. **تتم معالجة بياناتك بشكل آمن ولا تُستخدم لتدريب نماذج الذاء الاصطناعي العامة.**
- **تقديم الخدمة:** للحفاظ على حسابك وتقديم الميزات الأساسية لمتتبع النفقات.
- **تحسين الخدمة:** لتحليل اتجاهات الاستخدام وتحسين وظائف التطبيق.
- **الأمن والامتثال:** للكشف عن الاحتيال والوصول غير المصرح به ومنعهما والامتثال للالتزامات القانونية.

## 4. أمن البيانات وتشفيرها
نحمي بياناتك من خلال الضمانات التالية:
- **التشفير أثناء النقل:** تستخدم جميع الاتصالات بين التطبيق وخوادمنا ومزودي الخدمة لدينا بروتوكول TLS 1.2 أو أعلى.
- **التشفير عند السكون:** قاعدة بياناتنا، المستضافة لدى Supabase، مشفرة عند السكون باستخدام AES-256. كما يتم تشفير رموز الوصول المصرفية بشكل إضافي بواسطة تطبيقنا قبل تخزينها، ولا يتم إرسالها أبدًا إلى جهازك.
- **أمان الحساب:** يتم تخزين كلمات المرور فقط كتجزئات bcrypt مملحة، وليس بصيغة قابلة للقراءة أبدًا. ويتم تحديد معدل محاولات تسجيل الدخول لمنع هجمات تخمين كلمات المرور.
- **عزل البيانات:** يتم التحقق من كل طلب للبيانات المالية مقابل الحساب المسجل دخوله، بحيث لا يتمكن كل مستخدم إلا من الوصول إلى بياناته الخاصة.
- **التحكم في الوصول:** يقتصر الوصول إلى أنظمة الإنتاج على الموظفين المصرح لهم وفق مبدأ الامتياز الأقل، ويتطلب المصادقة متعددة العوامل.

## 5. مشاركة البيانات والأطراف الثالثة
نحن لا نبيع معلوماتك الشخصية. نحن نشارك البيانات فقط مع:
- **Plaid:** لتسهيل الاتصال المصرفي.
- **Supabase:** لاستضافة قاعدة البيانات.
- **Google Cloud:** لاستضافة التطبيق ومعالجة الذكاء الاصطناعي (Google Gemini).
- **شركاء الإعلان:** نظرًا لأن المستوى المجاني مدعوم بالإعلانات، فقد نشارك معرفات الأجهزة المجهولة مع شركاء الإعلان (مثل Google AdMob) لتقديم إعلانات غير مخصصة للمستخدمين في المستوى المجاني.
- **السلطات القانونية:** عندما يقتضي القانون ذلك أو لحماية حقوقنا القانونية أو ممتلكاتنا أو سلامتنا.

## 6. حقوقك وحذف البيانات
### 6.1 الحق في الوصول وقابلية النقل
لديك الحق في طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك في شكل منظم وقابل للقراءة آليًا.

### 6.2 الحق في النسيان
يحق لك طلب حذف بياناتك الشخصية في أي وقت.
- **حذف الحساب:** عند حذف حسابك، يتم حذف تفاصيل حسابك ودفتر الأستاذ والبيانات المصرفية نهائيًا وفورًا من قاعدة بيانات الإنتاج لدينا، ويتم إلغاء وصولنا إلى بنوكك المرتبطة لدى Plaid. وتنتهي صلاحية النسخ المتبقية في النسخ الاحتياطية المشفرة لقاعدة البيانات تلقائيًا في غضون 30 يومًا.
- **فصل البنك:** عند فصل أحد البنوك، نلغي وصولنا لدى Plaid ونحذف فورًا الحسابات والأرصدة والمعاملات التي استرجعناها من تلك المؤسسة. أما المعاملات التي استوردتها سابقًا إلى دفتر الأستاذ الخاص بك فتبقى ضمن سجلاتك، ما لم تختر إزالتها عند الفصل أو تحذفها لاحقًا.
- **الطلبات عبر البريد الإلكتروني:** يمكنك أيضًا طلب حذف بياناتك أو الحصول على نسخة منها عبر مراسلتنا على **tradelab.mantis@gmail.com**. ونرد في غضون 30 يومًا.

### 6.3 الامتثال لـ GDPR و CCPA
إذا كنت مقيمًا في المنطقة الاقتصادية الأوروبية (EEA) أو كاليفورنيا، فلديك حقوق محددة فيما يتعلق بمعلوماتك الشخصية، بما في ذلك الحق في الوصول إلى بياناتك أو تصحيحها أو حذفها.

## 7. ملفات تعريف الارتباط والتتبع
نحن نستخدم ملفات تعريف الارتباط الأساسية للحفاظ على جلستك وتفضيلاتك. نحن لا نستخدم ملفات تعريف ارتباط تتبع تابعة لجهات خارجية لأغراض إعلانية.

## 8. خصوصية الأطفال
خدمتنا ليست مخصصة للاستخدام من قبل الأطفال دون سن 13 عامًا. نحن لا نجمع معلومات شخصية من الأطفال عن علم.

## 9. التغييرات على هذه السياسة
قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنخطرك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة وتحديث "تاريخ النفاذ".

## 10. اتصل بنا
إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارسات البيانات لدينا، يرجى الاتصال بنا على: **tradelab.mantis@gmail.com**
`;

export const TERMS_OF_SERVICE_HI = `
# सेवा की शर्तें

**प्रभावी तिथि: 18 मार्च, 2026**

## 1. शर्तों की स्वीकृति
हमारे एप्लिकेशन तक पहुँचने या उपयोग करने से, आप इन सेवा की शर्तों और हमारी गोपनीयता नीति से बाध्य होने के लिए सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो आपको सेवा तक पहुँचने या उपयोग करने की आवश्यकता नहीं है।

## 2. सेवा का विवरण
हम AI-संचालित व्यय ट्रैकिंग और वित्तीय प्रबंधन उपकरण प्रदान करते हैं। सेवा में बैंक कनेक्टिविटी, लेनदेन वर्गीकरण और वित्तीय रिपोर्टिंग शामिल है। हम किसी भी समय सेवा को संशोधित करने या बंद करने का अधिकार सुरक्षित रखते हैं। **सेवा तृतीय-पक्ष प्रदाताओं (प्लैड, Supabase, Google क्लाउड, Google मैप्स) पर निर्भर करती है। LedgerAI इन बाहरी प्रदाताओं के कारण होने वाली सेवा रुकावटों, डेटा अशुद्धियों या डाउनटाइम के लिए उत्तरदायी नहीं है।**

## 3. वित्तीय अस्वीकरण
**महत्वपूर्ण: हम वित्तीय सलाहकार नहीं हैं।**
- **केवल सूचनात्मक उद्देश्य:** इस एप्लिकेशन द्वारा प्रदान की गई अंतर्दृष्टि, रिपोर्ट और विश्लेषण केवल सूचनात्मक और शैक्षिक उद्देश्यों के लिए हैं।
- **कोई व्यावसायिक सलाह नहीं:** इस एप्लिकेशन में कुछ भी पेशेवर वित्तीय, निवेश, कानूनी या कर सलाह नहीं है।
- **उपयोगकर्ता की जिम्मेदारी:** आप अपने वित्तीय निर्णयों के लिए पूरी तरह जिम्मेदार हैं। हम महत्वपूर्ण वित्तीय परिवर्तन करने से पहले एक योग्य पेशेवर से परामर्श करने की सलाह देते हैं।

## 4. उपयोगकर्ता खाते
- **पंजीकरण:** खाता बनाते समय आपको सटीक और पूर्ण जानकारी प्रदान करनी होगी।
- **सुरक्षा:** आप अपने खाते के क्रेडेंशियल्स की गोपनीयता बनाए रखने और अपने खाते के तहत होने वाली सभी गतिविधियों के लिए जिम्मेदार हैं।
- **अनधिकृत उपयोग:** आपको अपने खाते के किसी भी अनधिकृत उपयोग के बारे में हमें तुरंत सूचित करना चाहिए।

## 5. निषिद्ध आचरण
आप सहमत हैं कि आप:
- किसी भी अवैध या अनधिकृत उद्देश्य के लिए सेवा का उपयोग नहीं करेंगे।
- सेवा के बुनियादी ढांचे को हैक करने, अस्थिर करने या हस्तक्षेप करने का प्रयास नहीं करेंगे।
- अनुमति के बिना सेवा तक पहुँचने के लिए स्वचालित सिस्टम (बॉट्स, स्क्रैपर्स) का उपयोग नहीं करेंगे।
- किसी भी व्यक्ति या संस्था का रूप धारण नहीं करेंगे।

## 6. बौद्धिक संपदा
सॉफ्टवेयर, डिजाइन और ब्रांडिंग सहित सेवा की सभी सामग्री, विशेषताएं और कार्यक्षमता हमारी कंपनी की अनन्य संपत्ति हैं और अंतरराष्ट्रीय कॉपीराइट और ट्रेडमार्क कानूनों द्वारा संरक्षित हैं।

## 7. दायित्व की सीमा
कानून द्वारा अनुमत अधिकतम सीमा तक, हम आपके सेवा के उपयोग के परिणामस्वरूप होने वाले किसी भी अप्रत्यक्ष, आकस्मिक, विशेष या परिणामी नुकसान के लिए उत्तरदायी नहीं होंगे, जिसमें लाभ, डेटा या उपयोग की हानि शामिल है। हमारा कुल दायित्व पिछले 12 महीनों में सेवा के लिए आपके द्वारा भुगतान की गई राशि से अधिक नहीं होगा।

## 8. क्षतिपूर्ति
आप सेवा के अपने उपयोग या इन शर्तों के उल्लंघन से उत्पन्न होने वाले किसी भी दावे, क्षति या खर्च से हमें क्षतिपूर्ति करने और हमें हानिरहित रखने के लिए सहमत हैं।

## 9. समाप्ति
हम अपने विवेकाधिकार में, बिना किसी सूचना के, आपके द्वारा इन शर्तों का उल्लंघन करने या अन्य उपयोगकर्ताओं या हमारे व्यावसायिक हितों के लिए हानिकारक आचरण के लिए सेवा तक आपकी पहुंच को समाप्त या निलंबित करने का अधिकार सुरक्षित रखते हैं।

## 10. सदस्यता और धनवापसी
प्रीमियम (CA$19.51) और एंटरप्राइज (CA$65.06) स्तरों के लिए सभी सदस्यताएँ और भुगतान Apple ऐप स्टोर या Google Play स्टोर के माध्यम से संसाधित किए जाते हैं। धनवापसी संबंधित ऐप स्टोर प्रदाता की नीतियों के अधीन है।

## 11. शासी कानून और विवाद समाधान
ये शर्तें ओंटारियो प्रांत के कानूनों और कनाडा के संघीय कानूनों द्वारा शासित होंगी। इन शर्तों से उत्पन्न होने वाले किसी भी विवाद को स्थानीय मध्यस्थता संघ के नियमों के अनुसार बाध्यकारी मध्यस्थता के माध्यम से हल किया जाएगा।

## 12. शर्तों में बदलाव
हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं। ऐसे परिवर्तनों के बाद सेवा का आपका निरंतर उपयोग नई शर्तों की आपकी स्वीकृति माना जाएगा।

## 13. संपर्क
इन शर्तों के संबंध में किसी भी प्रश्न के लिए, कृपया **tradelab.mantis@gmail.com** पर संपर्क करें
`;

export const TERMS_OF_SERVICE_AR = `
# شروط الخدمة

**تاريخ النفاذ: 18 مارس 2026**

## 1. قبول الشروط
من خلال الوصول إلى تطبيقنا أو استخدامه، فإنك توافق على الالتزام بشروط الخدمة هذه وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق على هذه الشروط، فيجب عليك عدم الوصول إلى الخدمة أو استخدامها.

## 2. وصف الخدمة
نحن نقدم أداة لتتبع النفقات والإدارة المالية مدعومة بالذكاء الاصطناعي. تشمل الخدمة الاتصال المصرفي وتصنيف المعاملات والتقارير المالية. نحن نحتفظ بالحق في تعديل الخدمة أو إيقافها في أي وقت. **تعتمد الخدمة على مزودي طرف ثالث (Plaid و Supabase و Google Cloud و Google Maps). LedgerAI ليس مسؤولاً عن انقطاع الخدمة أو عدم دقة البيانات أو التوقف الناتج عن هؤلاء المزودين الخارجيين.**

## 3. إخلاء المسؤولية المالية
**هام: نحن لسنا مستشارين ماليين.**
- **لأغراض إعلامية فقط:** الرؤى والتقارير والتحليلات التي يقدمها هذا التطبيق هي لأغراض إعلامية وتعليمية فقط.
- **لا توجد نصيحة مهنية:** لا يوجد شيء في هذا التطبيق يشكل نصيحة مالية أو استثمارية أو قانونية أو ضريبية مهنية.
- **مسؤولية المستخدم:** أنت وحدك المسؤول عن قراراتك المالية. نوصي باستشارة متخصص مؤهل قبل إجراء تغييرات مالية كبيرة.

## 4. حسابات المستخدمين
- **التسجيل:** يجب عليك تقديم معلومات دقيقة وكاملة عند إنشاء حساب.
- **الأمن:** أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تحدث تحت حسابك.
- **الاستخدام غير المصرح به:** يجب عليك إخطارنا فورًا بأي استخدام غير مصرح به لحسابك.

## 5. السلوك المحظور
أنت توافق على عدم:
- استخدام الخدمة لأي غرض غير قانوني أو غير مصرح به.
- محاولة اختراق البنية التحتية للخدمة أو زعزعة استقرارها أو التدخل فيها.
- استخدام الأنظمة الآلية (البوتات، أدوات الكشط) للوصول إلى الخدمة دون إذن.
- انتحال شخصية أي شخص أو كيان.

## 6. الملكية الفكرية
جميع محتويات الخدمة وميزاتها ووظائفها، بما في ذلك على سبيل المثال لا الحصر البرامج والتصميم والعلامات التجارية، هي ملكية حصرية لشركتنا ومحمية بموجب قوانين حقوق النشر والعلامات التجارية الدولية.

## 7. تحديد المسؤولية
إلى أقصى حد يسمح به القانون، لن نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية، بما في ذلك خسارة الأرباح أو البيانات أو الاستخدام، الناتجة عن استخدامك للخدمة. لن تتجاوز مسؤوليتنا الإجمالية المبلغ الذي دفعته مقابل الخدمة في آخر 12 شهرًا.

## 8. التعويض
أنت توافق على تعويضنا وإبراء ذمتنا من أي مطالبات أو أضرار أو نفقات تنشأ عن استخدامك للخدمة أو انتهاك هذه الشروط.

## 9. الإنهاء
نحن نحتفظ بالحق في إنهاء أو تعليق وصولك إلى الخدمة وفقًا لتقديرنا الخاص، دون إشعار، بسبب السلوك الذي نعتقد أنه ينتهك هذه الشروط أو يضر بالمستخدمين الآخرين أو مصالحنا التجارية.

## 10. الاشتراك والاسترداد
تتم معالجة جميع الاشتراكات والمدفوعات لمستويات Premium (19.51 دولارًا كنديًا) و Enterprise (65.06 دولارًا كنديًا) عبر متجر تطبيقات Apple أو متجر Google Play. تخضع عمليات الاسترداد لسياسات مزود متجر التطبيقات المعني.

## 11. القانون الحاكم وحل النزاعات
تخضع هذه الشروط لقوانين مقاطعة أونتاريو والقوانين الفيدرالية لكندا. يتم حل أي نزاعات تنشأ عن هذه الشروط من خلال تحكيم ملزم وفقًا لقواعد جمعية التحكيم المحلية.

## 12. التغييرات على الشروط
نحن نحتفظ بالحق في تعديل هذه الشروط في أي وقت. إن استمرارك في استخدام الخدمة بعد هذه التغييرات يشكل قبولك للشروط الجديدة.

## 13. الاتصال
لأية أسئلة تتعلق بهذه الشروط، يرجى الاتصال بـ **tradelab.mantis@gmail.com**
`;

export const DATA_RETENTION_POLICY_HI = `
# डेटा प्रतिधारण और सुरक्षा नीति

**प्रभावी तिथि: 16 अक्टूबर, 2026**

## 1. अवलोकन
यह नीति बताती है कि LedgerAI कौन-सा डेटा रखता है, हम उसे कितने समय तक रखते हैं और उसे कैसे हटाया जाता है। यह हमारे द्वारा संसाधित सभी व्यक्तिगत और वित्तीय डेटा पर लागू होती है, जिसमें प्लैड के माध्यम से प्राप्त डेटा भी शामिल है। हम इस नीति की वर्ष में कम से कम एक बार और जब भी हमारी डेटा प्रथाएं बदलती हैं, समीक्षा करते हैं।

## 2. प्रतिधारण सिद्धांत
- **डेटा न्यूनीकरण:** हम केवल वही प्लैड उत्पाद मांगते हैं जो LedgerAI की सुविधाओं के लिए आवश्यक हैं (लेनदेन, पहचान और शेष राशि)।
- **उद्देश्य सीमा:** डेटा का उपयोग केवल हमारी गोपनीयता नीति में वर्णित सेवा प्रदान करने के लिए किया जाता है।
- **भंडारण सीमा:** हम डेटा केवल तब तक रखते हैं जब तक आपका खाता सक्रिय है, या जब तक कानून द्वारा आवश्यक हो।

## 3. प्रतिधारण अवधि
- **खाता और लेजर डेटा:** जब तक आपका खाता सक्रिय है, तब तक रखा जाता है।
- **प्लैड से प्राप्त बैंक डेटा** (खाते, शेष राशियां, लेनदेन और एक्सेस टोकन): जब तक आप उस बैंक को डिस्कनेक्ट नहीं करते या अपना खाता नहीं हटाते, तब तक रखा जाता है।
- **सर्वर लॉग:** सुरक्षा और समस्या निवारण के लिए 30 दिनों तक रखे जाते हैं।
- **डेटाबेस बैकअप:** एन्क्रिप्टेड होते हैं, और 30 दिनों के भीतर स्वचालित रूप से समाप्त हो जाते हैं।

## 4. विलोपन
- **खाता हटाना:** आप ऐप से या **tradelab.mantis@gmail.com** पर ईमेल करके अपना खाता हटा सकते हैं। आपका खाता, लेजर और बैंक डेटा हमारे उत्पादन डेटाबेस से तुरंत और स्थायी रूप से हटा दिया जाता है, और आपके लिंक किए गए बैंकों तक हमारी पहुंच प्लैड के साथ रद्द कर दी जाती है। एन्क्रिप्टेड बैकअप में मौजूद प्रतियां 30 दिनों के भीतर समाप्त हो जाती हैं।
- **बैंक डिस्कनेक्शन:** किसी बैंक को डिस्कनेक्ट करने से प्लैड के साथ हमारी पहुंच रद्द हो जाती है और उससे प्राप्त खाते, शेष राशियां और लेनदेन तुरंत हटा दिए जाते हैं। आप उस बैंक से अपने लेजर में आयात किए गए लेनदेन को भी हटाने का विकल्प चुन सकते हैं।
- **आपके डिवाइस पर डेटा:** LedgerAI ऑफ़लाइन काम करने के लिए आपके डिवाइस पर आपके लेजर की एक कार्यशील प्रति रखता है। ऐप को अनइंस्टॉल करने से यह प्रति हट जाती है।

## 5. सुरक्षा नियंत्रण
- **एन्क्रिप्शन:** ट्रांजिट में टीएलएस 1.2 या उच्चतर; हमारे डेटाबेस में एट रेस्ट एईएस-256। बैंक एक्सेस टोकन हमारे एप्लिकेशन द्वारा अतिरिक्त रूप से एन्क्रिप्ट किए जाते हैं।
- **पहुंच नियंत्रण:** उत्पादन सिस्टम तक न्यूनतम विशेषाधिकार के आधार पर पहुंच, और हमारे डेटाबेस, होस्टिंग और सोर्स कोड तक सभी प्रशासनिक पहुंच के लिए मल्टी-फैक्टर ऑथेंटिकेशन अनिवार्य।
- **भेद्यता प्रबंधन:** स्वचालित निर्भरता और कोड स्कैनिंग, और पहचानी गई कमजोरियों को गंभीरता के आधार पर निर्धारित समय-सीमा के भीतर ठीक किया जाता है।
- **घटना प्रतिक्रिया:** हम एक घटना प्रतिक्रिया योजना बनाए रखते हैं जिसमें पहचान, रोकथाम, उन्मूलन और पुनर्प्राप्ति शामिल हैं। यदि किसी उल्लंघन से आपका डेटा प्रभावित होता है, तो हम लागू कानून के अनुसार आपको और संबंधित अधिकारियों को सूचित करेंगे।

## 6. डेटा निपटान
हटाया गया डेटा हमारे उत्पादन डेटाबेस से स्थायी रूप से हटा दिया जाता है, न कि केवल छिपाया या हटाए गए के रूप में चिह्नित किया जाता है।
`;

export const DATA_RETENTION_POLICY_AR = `
# سياسة الاحتفاظ بالبيانات وأمنها

**تاريخ النفاذ: 16 أكتوبر 2026**

## 1. نظرة عامة
توضح هذه السياسة البيانات التي يحتفظ بها LedgerAI، ومدة احتفاظنا بها، وكيفية حذفها. وتنطبق على جميع البيانات الشخصية والمالية التي نعالجها، بما في ذلك البيانات المستلمة عبر Plaid. نراجع هذه السياسة مرة واحدة على الأقل سنويًا وكلما تغيرت ممارساتنا المتعلقة بالبيانات.

## 2. مبادئ الاحتفاظ
- **تقليل البيانات:** لا نطلب سوى منتجات Plaid اللازمة لميزات LedgerAI (المعاملات والهوية والرصيد).
- **تحديد الغرض:** تُستخدم البيانات فقط لتقديم الخدمة كما هو موضح في سياسة الخصوصية الخاصة بنا.
- **تحديد مدة التخزين:** نحتفظ بالبيانات فقط طالما كان حسابك نشطًا، أو للمدة التي يقتضيها القانون.

## 3. فترات الاحتفاظ
- **بيانات الحساب ودفتر الأستاذ:** يُحتفظ بها طالما كان حسابك نشطًا.
- **البيانات المصرفية من Plaid** (الحسابات والأرصدة والمعاملات ورموز الوصول): يُحتفظ بها حتى تفصل ذلك البنك أو تحذف حسابك.
- **سجلات الخادم:** يُحتفظ بها لمدة تصل إلى 30 يومًا لأغراض الأمن واستكشاف الأخطاء وإصلاحها.
- **النسخ الاحتياطية لقاعدة البيانات:** مشفرة، وتنتهي صلاحيتها تلقائيًا في غضون 30 يومًا.

## 4. الحذف
- **حذف الحساب:** يمكنك حذف حسابك من التطبيق أو بمراسلتنا على **tradelab.mantis@gmail.com**. يتم حذف حسابك ودفتر الأستاذ والبيانات المصرفية نهائيًا وفورًا من قاعدة بيانات الإنتاج لدينا، ويتم إلغاء وصولنا إلى بنوكك المرتبطة لدى Plaid. وتنتهي صلاحية النسخ الموجودة في النسخ الاحتياطية المشفرة في غضون 30 يومًا.
- **فصل البنك:** يؤدي فصل أحد البنوك إلى إلغاء وصولنا لدى Plaid وحذف الحسابات والأرصدة والمعاملات المسترجعة منه فورًا. ويمكنك أيضًا اختيار إزالة المعاملات التي استوردتها إلى دفتر الأستاذ من ذلك البنك.
- **البيانات على جهازك:** يحتفظ LedgerAI بنسخة عمل من دفتر الأستاذ الخاص بك على جهازك حتى يعمل دون اتصال بالإنترنت. وتؤدي إزالة تثبيت التطبيق إلى حذف هذه النسخة.

## 5. الضوابط الأمنية
- **التشفير:** TLS 1.2 أو أعلى أثناء النقل؛ وAES-256 عند السكون في قاعدة بياناتنا. كما يتم تشفير رموز الوصول المصرفية بشكل إضافي بواسطة تطبيقنا.
- **التحكم في الوصول:** وصول إلى أنظمة الإنتاج وفق مبدأ الامتياز الأقل، مع اشتراط المصادقة متعددة العوامل لجميع عمليات الوصول الإداري إلى قاعدة بياناتنا واستضافتنا وشيفرتنا المصدرية.
- **إدارة الثغرات الأمنية:** فحص آلي للتبعيات والشيفرة، مع إصلاح الثغرات المكتشفة ضمن مهل زمنية محددة حسب درجة خطورتها.
- **الاستجابة للحوادث:** نحتفظ بخطة للاستجابة للحوادث تشمل التحديد والاحتواء والاستئصال والتعافي. وإذا أثر أي اختراق على بياناتك، فسنخطرك ونخطر السلطات المختصة وفقًا لما يقتضيه القانون المعمول به.

## 6. التخلص من البيانات
تتم إزالة البيانات المحذوفة نهائيًا من قاعدة بيانات الإنتاج لدينا، ولا يقتصر الأمر على إخفائها أو تمييزها كمحذوفة.
`;
