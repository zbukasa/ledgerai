
export const LEGAL_CONFIG = {
    PRIVACY_POLICY_URL: "https://your-app-url.run.app/privacy",
    TERMS_URL: "https://your-app-url.run.app/terms",
    LAST_UPDATED: "March 17, 2026",
};

export const PRIVACY_POLICY = `
# Privacy Policy

**Effective Date: March 18, 2026**

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
We implement industry-leading security measures to protect your data:
- **Encryption at Rest:** All sensitive data is stored on Google Cloud Platform (GCP) using AES-256 encryption.
- **Encryption in Transit:** Data is transmitted using TLS 1.2 or higher to ensure secure communication between your device and our servers.
- **Access Control:** We follow the Principle of Least Privilege (PoLP). Access to production data is strictly controlled via GCP Identity and Access Management (IAM).
- **Audit Logs:** We maintain immutable audit logs of all data access and modifications.

## 5. Data Sharing & Third Parties
We do not sell your personal information. We share data only with:
- **Plaid:** To facilitate bank connectivity.
- **Google Cloud:** For hosting, database management, and AI processing.
- **Ad Partners:** Since the Free Tier is ad-supported, we may share anonymized device identifiers with advertising partners (such as Google AdMob) to serve non-personalized advertisements to users on the Free Tier.
- **Legal Authorities:** When required by law or to protect our legal rights, property, or safety.

## 6. Your Rights & Data Deletion
### 6.1 Right to Access and Portability
You have the right to request a copy of the personal data we hold about you in a structured, machine-readable format.

### 6.2 Right to be Forgotten
You have the right to request the deletion of your personal data at any time. 
- **Account Termination:** Upon closing your account, all personal and financial data is purged from our active databases within 24 hours.
- **Plaid Disconnection:** If you disconnect a specific bank account, all data associated with that connection is deleted from our systems immediately.

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

**Date d'entrée en vigueur : 18 mars 2026**

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
Nous mettons en œuvre des mesures de sécurité de pointe pour protéger vos données :
- **Cryptage au repos :** Toutes les données sensibles sont stockées sur Google Cloud Platform (GCP) à l'aide du cryptage AES-256.
- **Cryptage en transit :** Les données sont transmises via TLS 1.2 ou supérieur pour garantir une communication sécurisée entre votre appareil et nos serveurs.
- **Contrôle d'accès :** Nous suivons le principe du moindre privilège (PoLP). L'accès aux données de production est strictement contrôlé via GCP Identity and Access Management (IAM).
- **Journaux d'audit :** Nous maintenons des journaux d'audit immuables de tous les accès et modifications de données.

## 5. Partage de données et tiers
Nous ne vendons pas vos informations personnelles. Nous partageons des données uniquement avec :
- **Plaid :** Pour faciliter la connectivité bancaire.
- **Google Cloud :** Pour l'hébergement, la gestion de base de données et le traitement de l'IA.
- **Partenaires publicitaires :** Étant donné que le niveau gratuit est financé par la publicité, nous pouvons partager des identifiants d'appareil anonymisés avec des partenaires publicitaires (tels que Google AdMob) pour diffuser des publicités non personnalisées aux utilisateurs du niveau gratuit.
- **Autorités légales :** Lorsque la loi l'exige ou pour protéger nos droits légaux, nos biens ou notre sécurité.

## 6. Vos droits et suppression de données
### 6.1 Droit d'accès et de portabilité
Vous avez le droit de demander une copie des données personnelles que nous détenons à votre sujet dans un format structuré et lisible par machine.

### 6.2 Droit à l'oubli
Vous avez le droit de demander la suppression de vos données personnelles à tout moment.
- **Résiliation du compte :** Lors de la fermeture de votre compte, toutes les données personnelles et financières sont purgées de nos bases de données actives dans les 24 heures.
- **Déconnexion Plaid :** Si vous déconnectez un compte bancaire spécifique, toutes les données associées à cette connexion sont immédiatement supprimées de nos systèmes.

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

**Fecha de entrada en vigor: 18 de marzo de 2026**

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
Implementamos medidas de seguridad líderes en la industria para proteger sus datos:
- **Cifrado en reposo:** Todos los datos confidenciales se almacenan en Google Cloud Platform (GCP) mediante cifrado AES-256.
- **Cifrado en tránsito:** Los datos se transmiten mediante TLS 1.2 o superior para garantizar una comunicación segura entre su dispositivo y nuestros servidores.
- **Control de acceso:** Seguimos el Principio de Menor Privilegio (PoLP). El acceso a los datos de producción está estrictamente controlado a través de Google Cloud Identity and Access Management (IAM).
- **Registros de auditoría:** Mantenemos registros de auditoría inmutables de todo el acceso y las modificaciones de datos.

## 5. Intercambio de datos y terceros
No vendemos su información personal. Compartimos datos solo con:
- **Plaid:** Para facilitar la conectividad bancaria.
- **Google Cloud:** Para alojamiento, gestión de bases de datos y procesamiento de IA.
- **Socios publicitarios:** Dado que el Nivel Gratuito se financia con publicidad, podemos compartir identificadores de dispositivos anónimos con socios publicitarios (como Google AdMob) para mostrar anuncios no personalizados a los usuarios del Nivel Gratuito.
- **Autoridades legales:** Cuando lo exija la ley o para proteger nuestros derechos legales, propiedad o seguridad.

## 6. Sus derechos y eliminación de datos
### 6.1 Derecho de acceso y portabilidad
Tiene derecho a solicitar una copia de los datos personales que tenemos sobre usted en un formato estructurado y legible por máquina.

### 6.2 Derecho al olvido
Tiene derecho a solicitar la eliminación de sus datos personales en cualquier momento.
- **Terminación de la cuenta:** Al cerrar su cuenta, todos los datos personales y financieros se eliminan de nuestras bases de datos activas en un plazo de 24 horas.
- **Desconexión de Plaid:** Si desconecta una cuenta bancaria específica, todos los datos asociados con esa conexión se eliminan de nuestros sistemas de inmediato.

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

**Data de vigência: 18 de março de 2026**

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
Implementamos medidas de segurança líderes do setor para proteger seus dados:
- **Criptografia em Repouso:** Todos os dados confidenciais são armazenados no Google Cloud Platform (GCP) usando criptografia AES-256.
- **Criptografia em Trânsito:** Os dados são transmitidos usando TLS 1.2 ou superior para garantir a comunicação segura entre seu dispositivo e nossos servidores.
- **Controle de Acesso:** Seguimos o Princípio do Menor Privilégio (PoLP). O acesso aos dados de produção é estritamente controlado via Google Cloud Identity and Access Management (IAM).
- **Logs de Auditoria:** Mantemos logs de auditoria imutáveis de todos os acessos e modificações de dados.

## 5. Compartilhamento de Dados e Terceiros
Não vendemos suas informações pessoais. Compartilhamos dados apenas com:
- **Plaid:** Para facilitar a conectividade bancária.
- **Google Cloud:** Para hospedagem, gerenciamento de banco de dados e processamento de IA.
- **Parceiros de Publicidade:** Como o Nível Gratuito é suportado por anúncios, podemos compartilhar identificadores de dispositivos anônimos com parceiros de publicidade (como o Google AdMob) para exibir anúncios não personalizados para usuários no Nível Gratuito.
- **Autoridades Legais:** Quando exigido por lei ou para proteger nossos direitos legais, propriedade ou segurança.

## 6. Seus Direitos e Exclusão de Dados
### 6.1 Direito de Acesso e Portabilidade
Você tem o direito de solicitar uma cópia dos dados pessoais que mantemos sobre você em um formato estruturado e legível por máquina.

### 6.2 Direito ao Esquecimento
Você tem o direito de solicitar a exclusão de seus dados pessoais a qualquer momento.
- **Encerramento da Conta:** Ao fechar sua conta, todos os dados pessoais e financeiros são eliminados de nossos bancos de dados ativos em 24 horas.
- **Desconexão da Plaid:** Se você desconectar uma conta bancária específica, todos os dados associados a essa conexão serão excluídos de nossos sistemas imediatamente.

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
We provide an AI-powered expense tracking and financial management tool. The service includes bank connectivity, transaction categorization, and financial reporting. We reserve the right to modify or discontinue the service at any time. **The Service relies on third-party providers (Plaid, Google Cloud, Google Maps). LedgerAI is not liable for service interruptions, data inaccuracies, or downtime caused by these external providers.**

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
Nous fournissons un outil de suivi des dépenses et de gestion financière alimenté par l'IA. Le service comprend la connectivité bancaire, la catégorisation des transactions et les rapports financiers. Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment. **Le Service s'appuie sur des prestataires tiers (Plaid, Google Cloud, Google Maps). LedgerAI n'est pas responsable des interruptions de service, des inexactitudes de données ou des temps d'arrêt causés par des prestataires externes.**

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
Proporcionamos una herramienta de gestión financiera y seguimiento de gastos impulsada por IA. El servicio incluye conectividad bancaria, categorización de transacciones e informes financieros. Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento. **El Servicio depende de proveedores externos (Plaid, Google Cloud, Google Maps). LedgerAI no es responsable de las interrupciones del servicio, las inexactitudes de los datos o el tiempo de inactividad causado por estos proveedores externos.**

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
Fornecemos uma ferramenta de gerenciamento financeiro e rastreamento de despesas com tecnologia de IA. O serviço inclui conectividade bancária, categorização de transações e relatórios financeiros. Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento. **O Serviço depende de provedores terceirizados (Plaid, Google Cloud, Google Maps). O LedgerAI não é responsável por interrupções de serviço, imprecisões de dados ou tempo de inatividade causado por esses provedores externos.**

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

## 1. Overview
This policy outlines our commitment to data minimization and secure retention practices, specifically designed to satisfy Plaid's Q11 security requirements and international data protection standards.

## 2. Retention Principles
- **Purpose Limitation:** We only retain data that is necessary for the provision of our services. **We only request the specific scopes from Plaid (Transactions, Identity, Balance) necessary to provide the Ledger features.**
- **Storage Limitation:** Data is deleted as soon as it is no longer required for its original purpose.
- **Accuracy:** We take reasonable steps to ensure that the data we retain is accurate and up to date.

## 3. Retention Periods
- **Active User Data:** Retained for the duration of your active account.
- **Transaction History:** Retained for up to 7 years for tax and compliance purposes, or until account deletion.
- **Audit Logs:** Retained for 12 months to ensure security and accountability.
- **Backup Data:** Encrypted backups are retained for 30 days before being permanently overwritten.

## 4. Immediate Deletion (Plaid Q11 Compliance)
We implement strict deletion protocols for financial data:
- **Account Termination:** When a user terminates their account, all associated financial records, transaction history, and PII are permanently deleted from our production systems within 24 hours.
- **Bank Unlinking:** If a user unlinks a specific financial institution, all data retrieved from that institution is immediately purged.

## 5. Security Controls
- **Infrastructure:** All data resides within Google Cloud Platform's secure environment.
- **Encryption:** AES-256 encryption is applied to all data at rest.
- **Vulnerability Management:** We perform automated container scanning and regular security audits.
- **Audit & MFA:** We maintain immutable audit logs for all administrative access and critical system changes to ensure accountability. Multi-Factor Authentication (MFA) is enabled for all administrative access to the Google Cloud Console and is available to all end-users via Firebase Authentication.
- **Network Security:** We use Virtual Private Clouds (VPC) and firewalls to isolate production environments.

## 6. Data Disposal
When data reaches the end of its retention period, it is securely deleted using industry-standard methods that ensure the data cannot be recovered.

## 7. Incident Response
We maintain a robust Incident Response Plan (IRP) to address any potential security breaches, including identification, containment, eradication, and recovery phases. In the event of a data breach, we will notify affected users and relevant authorities in accordance with applicable laws.
`;

export const DATA_RETENTION_POLICY_FR = `
# Politique de conservation et de sécurité des données

## 1. Aperçu
Cette politique souligne notre engagement envers la minimisation des données et les pratiques de conservation sécurisées, spécifiquement conçues pour satisfaire aux exigences de sécurité Q11 de Plaid et aux normes internationales de protection des données.

## 2. Principes de conservation
- **Limitation des finalités :** Nous ne conservons que les données nécessaires à la fourniture de nos services. **Nous ne demandons que les portées spécifiques de Plaid (Transactions, Identité, Solde) nécessaires pour fournir les fonctionnalités de Ledger.**
- **Limitation du stockage :** Les données sont supprimées dès qu'elles ne sont plus nécessaires à leur finalité initiale.
- **Exactitude :** Nous prenons des mesures raisonnables pour nous assurer que les données que nous conservons sont exactes et à jour.

## 3. Périodes de conservation
- **Données d'utilisateur actif :** Conservées pendant la durée de votre compte actif.
- **Historique des transactions :** Conservé jusqu'à 7 ans à des fins fiscales et de conformité, ou jusqu'à la suppression du compte.
- **Journaux d'audit :** Conservés pendant 12 mois pour assurer la sécurité et la responsabilité.
- **Données de sauvegarde :** Les sauvegardes cryptées sont conservées pendant 30 jours avant d'être définitivement écrasées.

## 4. Suppression immédiate (Conformité Plaid Q11)
Nous mettons en œuvre des protocoles de suppression stricts pour les données financières :
- **Résiliation du compte :** Lorsqu'un utilisateur résilie son compte, tous les dossiers financiers associés, l'historique des transactions et les PII sont définitivement supprimés de nos systèmes de production dans les 24 heures.
- **Dissociation bancaire :** Si un utilisateur dissocie une institution financière spécifique, toutes les données récupérées auprès de cette institution sont immédiatement purgées.

## 5. Contrôles de sécurité
- **Infrastructure :** Toutes les données résident dans l'environnement sécurisé de Google Cloud Platform.
- **Cryptage :** Le cryptage AES-256 est appliqué à toutes les données au repos.
- **Gestion des vulnérabilités :** Nous effectuons une analyse automatisée des conteneurs et des audits de sécurité réguliers.
- **Audit et MFA :** Nous maintenons des journaux d'audit immuables pour tous les accès administratifs et les changements critiques du système afin d'assurer la responsabilité. L'authentification multifacteur (MFA) est activée pour tous les accès administratifs à la console Google Cloud et est disponible pour tous les utilisateurs finaux via Firebase Authentication.
- **Sécurité du réseau :** Nous utilisons des clouds privés virtuels (VPC) et des pare-feu pour isoler les environnements de production.

## 6. Élimination des données
Lorsque les données atteignent la fin de leur période de conservation, elles sont supprimées en toute sécurité à l'aide de méthodes standard de l'industrie qui garantissent que les données ne peuvent pas être récupérées.

## 7. Réponse aux incidents
Nous maintenons un plan de réponse aux incidents (IRP) robuste pour traiter toute violation potentielle de la sécurité, y compris les phases d'identification, de confinement, d'éradication et de récupération. En cas de violation de données, nous informerons les utilisateurs concernés et les autorités compétentes conformément aux lois applicables.
`;

export const DATA_RETENTION_POLICY_ES = `
# Política de Seguridad y Retención de Datos

## 1. Descripción general
Esta política describe nuestro compromiso con la minimización de datos y las prácticas de retención seguras, diseñadas específicamente para satisfacer los requisitos de seguridad Q11 de Plaid y los estándares internacionales de protección de datos.

## 2. Principios de retención
- **Limitación de la finalidad:** Solo retenemos los datos que son necesarios para la prestación de nuestros servicios. **Solo solicitamos los alcances específicos de Plaid (Transacciones, Identidad, Saldo) necesarios para proporcionar las funciones de Ledger.**
- **Limitación de almacenamiento:** Los datos se eliminan tan pronto como ya no son necesarios para su propósito original.
- **Exactitud:** Tomamos medidas razonables para garantizar que los datos que retenemos sean precisos y estén actualizados.

## 3. Períodos de retención
- **Datos de usuario activo:** Se conservan durante la duración de su cuenta activa.
- **Historial de transacciones:** Se conserva hasta por 7 años para fines fiscales y de cumplimiento, o hasta la eliminación de la cuenta.
- **Registros de auditoría:** Se conservan durante 12 meses para garantizar la seguridad y la rendición de cuentas.
- **Datos de respaldo:** Los respaldos cifrados se conservan durante 30 días antes de ser sobrescritos permanentemente.

## 4. Eliminación inmediata (Cumplimiento de Plaid Q11)
Implementamos protocolos de eliminación estrictos para los datos financieros:
- **Terminación de la cuenta:** Cuando un usuario termina su cuenta, todos los registros financieros asociados, el historial de transacciones y la PII se eliminan permanentemente de nuestros sistemas de producción en un plazo de 24 horas.
- **Desvinculación bancaria:** Si un usuario desvincula una institución financiera específica, todos los datos recuperados de esa institución se eliminan de inmediato.

## 5. Controles de seguridad
- **Infraestructura:** Todos los datos residen dentro del entorno seguro de Google Cloud Platform.
- **Cifrado:** El cifrado AES-256 se aplica a todos los datos en reposo.
- **Gestión de vulnerabilidades:** Realizamos escaneos de contenedores automatizados y auditorías de seguridad periódicas.
- **Auditoría y MFA:** Mantenemos registros de auditoría inmutables para todo el acceso administrativo y los cambios críticos del sistema para garantizar la rendición de cuentas. La autenticación de múltiples factores (MFA) está habilitada para todo el acceso administrativo a la consola de Google Cloud y está disponible para todos los usuarios finales a través de Firebase Authentication.
- **Seguridad de red:** Utilizamos nubes privadas virtuales (VPC) y firewalls para aislar los entornos de producción.

## 6. Eliminación de datos
Cuando los datos llegan al final de su período de retención, se eliminan de forma segura utilizando métodos estándar de la industria que garantizan que los datos no se puedan recuperar.

## 7. Respuesta a incidentes
Mantenemos un robusto Plan de Respuesta a Incidentes (IRP) para abordar cualquier posible brecha de seguridad, incluidas las fases de identificación, contención, erradicación y recuperación. En caso de una violación de datos, notificaremos a los usuarios afectados y a las autoridades pertinentes de acuerdo con las leyes aplicables.
`;

export const DATA_RETENTION_POLICY_PT = `
# Política de Retenção e Segurança de Dados

## 1. Visão Geral
Esta política descreve nosso compromisso com a minimização de dados e práticas de retenção seguras, projetadas especificamente para satisfazer os requisitos de segurança Q11 da Plaid e os padrões internacionais de proteção de dados.

## 2. Princípios de Retenção
- **Limitação de Finalidade:** Retemos apenas os dados necessários para a prestação de nossos serviços. **Solicitamos apenas os escopos específicos da Plaid (Transações, Identidade, Saldo) necessários para fornecer os recursos do Ledger.**
- **Limitação de Armazenamento:** Os dados são excluídos assim que não são mais necessários para sua finalidade original.
- **Precisão:** Tomamos medidas razoáveis para garantir que os dados que retemos sejam precisos e atualizados.

## 3. Períodos de Retenção
- **Dados de Usuário Ativo:** Retidos pela duração de sua conta ativa.
- **Histórico de Transações:** Retido por até 7 anos para fins fiscais e de conformidade, ou até a exclusão da conta.
- **Logs de Auditoria:** Retidos por 12 meses para garantir segurança e responsabilidade.
- **Dados de Backup:** Backups criptografados são retidos por 30 dias antes de serem substituídos permanentemente.

## 4. Exclusão Imediata (Conformidade Plaid Q11)
Implementamos protocolos de exclusão rigorosos para dados financeiros:
- **Encerramento da Conta:** Quando um usuário encerra sua conta, todos os registros financeiros associados, histórico de transações e PII são excluídos permanentemente de nossos sistemas de produção em 24 horas.
- **Desvinculação Bancária:** Se um usuário desvincular uma instituição financeira específica, todos os dados recuperados dessa instituição serão imediatamente eliminados.

## 5. Controles de Segurança
- **Infraestrutura:** Todos os dados residem no ambiente seguro do Google Cloud Platform.
- **Criptografia:** A criptografia AES-256 é aplicada a todos os dados em repouso.
- **Gerenciamento de Vulnerabilidades:** Realizamos varredura automatizada de contêineres e auditorias de segurança regulares.
- **Auditoria e MFA:** Mantemos logs de auditoria imutáveis para todos os acessos administrativos e alterações críticas do sistema para garantir a responsabilidade. A Autenticação de Múltiplos Fatores (MFA) está habilitada para todos os acessos administrativos ao Console do Google Cloud e está disponível para todos os usuários finais via Firebase Authentication.
- **Segurança de Rede:** Usamos Virtual Private Clouds (VPC) e firewalls para isolar ambientes de produção.

## 6. Eliminação de Dados
Quando os dados atingem o fim de seu período de retenção, eles são excluídos com segurança usando métodos padrão da indústria que garantem que os dados não possam ser recuperados.

## 7. Resposta a Incidentes
Mantemos um Plano de Resposta a Incidentes (IRP) robusto para lidar com quaisquer possíveis violações de segurança, incluindo as fases de identificação, contenção, erradicação e recuperação. No caso de uma violação de dados, notificaremos os usuários afetados e as autoridades relevantes de acordo com as leis aplicáveis.
`;

export const SECURITY_POLICY_INTERNAL = `
# Internal Information Security Policy (ISP)

## 1. Access Control
- **RBAC:** Access to production environments is restricted via Role-Based Access Control.
- **Least Privilege:** Employees are granted the minimum level of access required for their job functions.
- **GCP IAM:** All infrastructure access is managed through Google Cloud Identity and Access Management.

## 2. Vulnerability Management
- **Scanning:** Automated container scanning is enabled in GCP Artifact Registry.
- **Patching:** Security patches are applied to all systems within 30 days of release, or immediately for critical vulnerabilities.

## 3. Incident Response Plan
1. **Identify:** Detect and qualify the security incident.
2. **Contain:** Limit the scope and impact of the incident.
3. **Eradicate:** Remove the root cause of the vulnerability.
4. **Recover:** Restore systems to normal operation and perform a post-mortem.

## 4. Multi-Factor Authentication (MFA)
- **Developer Access:** System-level MFA is mandatory for all developers and administrators.
- **User Access:** Consumer MFA is implemented via Firebase Authentication to protect user accounts.
`;

export const SECURITY_POLICY_INTERNAL_FR = `
# Politique de sécurité de l'information interne (ISP)

## 1. Contrôle d'accès
- **RBAC :** L'accès aux environnements de production est restreint via le contrôle d'accès basé sur les rôles.
- **Moindre privilège :** Les employés bénéficient du niveau d'accès minimal requis pour leurs fonctions.
- **GCP IAM :** Tous les accès à l'infrastructure sont gérés via Google Cloud Identity and Access Management.

## 2. Gestion des vulnérabilités
- **Analyse :** L'analyse automatisée des conteneurs est activée dans GCP Artifact Registry.
- **Correctifs :** Les correctifs de sécurité sont appliqués à tous les systèmes dans les 30 jours suivant leur publication, ou immédiatement pour les vulnérabilités critiques.

## 3. Plan de réponse aux incidents
1. **Identifier :** Détecter et qualifier l'incident de sécurité.
2. **Contenir :** Limiter la portée et l'impact de l'incident.
3. **Éradiquer :** Supprimer la cause profonde de la vulnérabilité.
4. **Récupérer :** Restaurer les systèmes à un fonctionnement normal et effectuer un post-mortem.

## 4. Authentification multifacteur (MFA)
- **Accès développeur :** La MFA au niveau du système est obligatoire pour tous les développeurs et administrateurs.
- **Accès utilisateur :** La MFA grand public est mise en œuvre via Firebase Authentication pour protéger les comptes d'utilisateurs.
`;

export const SECURITY_POLICY_INTERNAL_ES = `
# Política de Seguridad de la Información Interna (ISP)

## 1. Control de Acceso
- **RBAC:** El acceso a los entornos de producción está restringido mediante el Control de Acceso Basado en Roles.
- **Mínimo Privilegio:** A los empleados se les otorga el nivel mínimo de acceso requerido para sus funciones laborales.
- **GCP IAM:** Todo el acceso a la infraestructura se gestiona a través de Google Cloud Identity and Access Management.

## 2. Gestión de Vulnerabilidades
- **Escaneo:** El escaneo automatizado de contenedores está habilitado en GCP Artifact Registry.
- **Parches:** Los parches de seguridad se aplican a todos los sistemas dentro de los 30 días posteriores a su lanzamiento, o de inmediato para vulnerabilidades críticas.

## 3. Plan de Respuesta a Incidentes
1. **Identificar:** Detectar y calificar el incidente de seguridad.
2. **Contener:** Limitar el alcance y el impacto del incidente.
3. **Erradicar:** Eliminar la causa raíz de la vulnerabilidad.
4. **Recuperar:** Restaurar los sistemas a su funcionamiento normal y realizar un post-mortem.

## 4. Autenticación de Múltiples Factores (MFA)
- **Acceso de Desarrollador:** El MFA a nivel de sistema es obligatorio para todos los desarrolladores y administradores.
- **Acceso de Usuario:** El MFA para el consumidor se implementa a través de Firebase Authentication para proteger las cuentas de usuario.
`;

export const SECURITY_POLICY_INTERNAL_PT = `
# Política de Segurança da Informação Interna (ISP)

## 1. Controle de Acesso
- **RBAC:** O acesso aos ambientes de produção é restrito via Controle de Acesso Baseado em Funções.
- **Privilégio Mínimo:** Os funcionários recebem o nível mínimo de acesso necessário para suas funções de trabalho.
- **GCP IAM:** Todo o acesso à infraestrutura é gerenciado por meio do Google Cloud Identity and Access Management.

## 2. Gerenciamento de Vulnerabilidades
- **Varredura:** A varredura automatizada de contêineres está habilitada no GCP Artifact Registry.
- **Correções:** As correções de segurança são aplicadas a todos os sistemas em até 30 dias após o lançamento, ou imediatamente para vulnerabilidades críticas.

## 3. Plano de Resposta a Incidentes
1. **Identificar:** Detectar e qualificar o incidente de segurança.
2. **Conter:** Limitar o escopo e o impacto do incidente.
3. **Erradicar:** Remover a causa raiz da vulnerabilidade.
4. **Recuperar:** Restaurar os sistemas à operação normal e realizar um post-mortem.

## 4. Autenticação de Múltiplos Fatores (MFA)
- **Acesso do Desenvolvedor:** O MFA no nível do sistema é obrigatório para todos os desenvolvedores e administradores.
- **Acesso do Usuário:** O MFA do consumidor é implementado via Firebase Authentication para proteger as contas de usuário.
`;

export const PRIVACY_POLICY_HI = `
# गोपनीयता नीति

**प्रभावी तिथि: 18 मार्च, 2026**

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
हम आपके डेटा की सुरक्षा के लिए उद्योग-अग्रणी सुरक्षा उपाय लागू करते हैं:
- **एन्क्रिप्शन एट रेस्ट:** सभी संवेदनशील डेटा को एईएस-256 एन्क्रिप्शन का उपयोग करके Google क्लाउड प्लेटफ़ॉर्म (GCP) पर संग्रहीत किया जाता है।
- **एन्क्रिप्शन इन ट्रांजिट:** आपके डिवाइस और हमारे सर्वर के बीच सुरक्षित संचार सुनिश्चित करने के लिए डेटा को टीएलएस 1.2 या उच्चतर का उपयोग करके प्रसारित किया जाता है।
- **पहुंच नियंत्रण:** हम न्यूनतम विशेषाधिकार के सिद्धांत (PoLP) का पालन करते हैं। उत्पादन डेटा तक पहुंच को GCP पहचान और पहुंच प्रबंधन (IAM) के माध्यम से कड़ाई से नियंत्रित किया जाता है।
- **ऑडिट लॉग:** हम सभी डेटा पहुंच और संशोधनों के अपरिवर्तनीय ऑडिट लॉग बनाए रखते हैं।

## 5. डेटा साझाकरण और तृतीय पक्ष
हम आपकी व्यक्तिगत जानकारी नहीं बेचते हैं। हम डेटा केवल इनके साथ साझा करते हैं:
- **प्लैड:** बैंक कनेक्टिविटी की सुविधा के लिए।
- **Google क्लाउड:** होस्टिंग, डेटाबेस प्रबंधन और AI प्रसंस्करण के लिए।
- **विज्ञापन भागीदार:** चूंकि फ्री टियर विज्ञापन-समर्थित है, इसलिए हम फ्री टियर के उपयोगकर्ताओं को गैर-व्यक्तिगत विज्ञापन दिखाने के लिए विज्ञापन भागीदारों (जैसे Google AdMob) के साथ अज्ञात डिवाइस पहचानकर्ता साझा कर सकते हैं।
- **कानूनी अधिकारी:** जब कानून द्वारा आवश्यक हो या हमारे कानूनी अधिकारों, संपत्ति या सुरक्षा की रक्षा के लिए।

## 6. आपके अधिकार और डेटा विलोपन
### 6.1 पहुंच और सुवाह्यता का अधिकार
आपको एक संरचित, मशीन-पठनीय प्रारूप में हमारे पास मौजूद आपके व्यक्तिगत डेटा की एक प्रति का अनुरोध करने का अधिकार है।

### 6.2 भूल जाने का अधिकार
आपको किसी भी समय अपने व्यक्तिगत डेटा को हटाने का अनुरोध करने का अधिकार है।
- **खाता समाप्ति:** अपना खाता बंद करने पर, सभी व्यक्तिगत और वित्तीय डेटा 24 घंटों के भीतर हमारे सक्रिय डेटाबेस से हटा दिए जाते हैं।
- **प्लैड डिस्कनेक्शन:** यदि आप किसी विशिष्ट बैंक खाते को डिस्कनेक्ट करते हैं, तो उस कनेक्शन से जुड़ा सारा डेटा हमारे सिस्टम से तुरंत हटा दिया जाता है।

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

**تاريخ النفاذ: 18 مارس 2026**

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
نحن نطبق تدابير أمنية رائدة في الصناعة لحماية بياناتك:
- **التشفير عند السكون:** يتم تخزين جميع البيانات الحساسة على منصة Google Cloud (GCP) باستخدام تشفير AES-256.
- **التشفير أثناء النقل:** يتم نقل البيانات باستخدام TLS 1.2 أو أعلى لضمان الاتصال الآمن بين جهازك وخوادمنا.
- **التحكم في الوصول:** نحن نتبع مبدأ الامتياز الأقل (PoLP). يتم التحكم في الوصول إلى بيانات الإنتاج بشكل صارم عبر إدارة الهوية والوصول (IAM) في GCP.
- **سجلات التدقيق:** نحن نحتفظ بسجلات تدقيق غير قابلة للتغيير لجميع عمليات الوصول إلى البيانات وتعديلها.

## 5. مشاركة البيانات والأطراف الثالثة
نحن لا نبيع معلوماتك الشخصية. نحن نشارك البيانات فقط مع:
- **Plaid:** لتسهيل الاتصال المصرفي.
- **Google Cloud:** للاستضافة وإدارة قواعد البيانات ومعالجة الذكاء الاصطناعي.
- **شركاء الإعلان:** نظرًا لأن المستوى المجاني مدعوم بالإعلانات، فقد نشارك معرفات الأجهزة المجهولة مع شركاء الإعلان (مثل Google AdMob) لتقديم إعلانات غير مخصصة للمستخدمين في المستوى المجاني.
- **السلطات القانونية:** عندما يقتضي القانون ذلك أو لحماية حقوقنا القانونية أو ممتلكاتنا أو سلامتنا.

## 6. حقوقك وحذف البيانات
### 6.1 الحق في الوصول وقابلية النقل
لديك الحق في طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك في شكل منظم وقابل للقراءة آليًا.

### 6.2 الحق في النسيان
لديك الحق في طلب حذف بياناتك الشخصية في أي وقت.
- **إنهاء الحساب:** عند إغلاق حسابك، يتم حذف جميع البيانات الشخصية والمالية من قواعد بياناتنا النشطة في غضون 24 ساعة.
- **فصل Plaid:** إذا قمت بفصل حساب مصرفي معين، فسيتم حذف جميع البيانات المرتبطة بهذا الاتصال من أنظمتنا على الفور.

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
हम AI-संचालित व्यय ट्रैकिंग और वित्तीय प्रबंधन उपकरण प्रदान करते हैं। सेवा में बैंक कनेक्टिविटी, लेनदेन वर्गीकरण और वित्तीय रिपोर्टिंग शामिल है। हम किसी भी समय सेवा को संशोधित करने या बंद करने का अधिकार सुरक्षित रखते हैं। **सेवा तृतीय-पक्ष प्रदाताओं (प्लैड, Google क्लाउड, Google मैप्स) पर निर्भर करती है। LedgerAI इन बाहरी प्रदाताओं के कारण होने वाली सेवा रुकावटों, डेटा अशुद्धियों या डाउनटाइम के लिए उत्तरदायी नहीं है।**

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
نحن نقدم أداة لتتبع النفقات والإدارة المالية مدعومة بالذكاء الاصطناعي. تشمل الخدمة الاتصال المصرفي وتصنيف المعاملات والتقارير المالية. نحن نحتفظ بالحق في تعديل الخدمة أو إيقافها في أي وقت. **تعتمد الخدمة على مزودي طرف ثالث (Plaid و Google Cloud و Google Maps). LedgerAI ليس مسؤولاً عن انقطاع الخدمة أو عدم دقة البيانات أو التوقف الناتج عن هؤلاء المزودين الخارجيين.**

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

## 1. अवलोकन
यह नीति डेटा न्यूनीकरण और सुरक्षित प्रतिधारण प्रथाओं के प्रति हमारी प्रतिबद्धता को रेखांकित करती है, जिसे विशेष रूप से प्लैड की Q11 सुरक्षा आवश्यकताओं और अंतरराष्ट्रीय डेटा सुरक्षा मानकों को पूरा करने के लिए डिज़ाइन किया गया है।

## 2. प्रतिधारण सिद्धांत
- **उद्देश्य सीमा:** हम केवल वही डेटा रखते हैं जो हमारी सेवाओं के प्रावधान के लिए आवश्यक है। **हम Ledger सुविधाएँ प्रदान करने के लिए आवश्यक प्लैड (लेनदेन, पहचान, शेष) से केवल विशिष्ट स्कोप का अनुरोध करते हैं।**
- **भंडारण सीमा:** डेटा को हटा दिया जाता है जैसे ही इसकी मूल उद्देश्य के लिए आवश्यकता नहीं रह जाती है।
- **सटीकता:** हम यह सुनिश्चित करने के लिए उचित कदम उठाते हैं कि हमारे द्वारा रखा गया डेटा सटीक और अद्यतित है।

## 3. प्रतिधारण अवधि
- **सक्रिय उपयोगकर्ता डेटा:** आपके सक्रिय खाते की अवधि के लिए रखा गया।
- **लेनदेन इतिहास:** कर और अनुपालन उद्देश्यों के लिए, या खाता हटाने तक 7 साल तक रखा गया।
- **ऑडिट लॉग:** सुरक्षा और जवाबदेही सुनिश्चित करने के लिए 12 महीने तक रखा गया।
- **बैकअप डेटा:** एन्क्रिप्टेड बैकअप को स्थायी रूप से अधिलेखित होने से पहले 30 दिनों के लिए रखा जाता है।

## 4. तत्काल विलोपन (प्लैड Q11 अनुपालन)
हम वित्तीय डेटा के लिए सख्त विलोपन प्रोटोकॉल लागू करते हैं:
- **खाता समाप्ति:** जब कोई उपयोगकर्ता अपना खाता समाप्त करता है, तो सभी संबंधित वित्तीय रिकॉर्ड, लेनदेन इतिहास और PII को 24 घंटों के भीतर हमारे उत्पादन सिस्टम से स्थायी रूप से हटा दिया जाता है।
- **बैंक अनलिंकिंग:** यदि कोई उपयोगकर्ता किसी विशिष्ट वित्तीय संस्थान को अनलिंक करता है, तो उस संस्थान से प्राप्त सभी डेटा तुरंत हटा दिया जाता है।

## 5. सुरक्षा नियंत्रण
- **बुनियादी ढांचा:** सारा डेटा Google क्लाउड प्लेटफ़ॉर्म के सुरक्षित वातावरण में रहता है।
- **एन्क्रिप्शन:** एईएस-256 एन्क्रिप्शन सभी डेटा एट रेस्ट पर लागू होता है।
- **भेद्यता प्रबंधन:** हम स्वचालित कंटेनर स्कैनिंग और नियमित सुरक्षा ऑडिट करते हैं।
- **ऑडिट और MFA:** हम जवाबदेही सुनिश्चित करने के लिए सभी प्रशासनिक पहुंच और महत्वपूर्ण सिस्टम परिवर्तनों के लिए अपरिवर्तनीय ऑडिट लॉग बनाए रखते हैं। Google क्लाउड कंसोल तक सभी प्रशासनिक पहुंच के लिए मल्टी-फैक्टर ऑथेंटिकेशन (MFA) सक्षम है और फायरबेस ऑथेंटिकेशन के माध्यम से सभी अंतिम उपयोगकर्ताओं के लिए उपलब्ध है।
- **नेटवर्क सुरक्षा:** हम उत्पादन वातावरण को अलग करने के लिए वर्चुअल प्राइवेट क्लाउड (VPC) और फायरवॉल का उपयोग करते हैं।

## 6. डेटा निपटान
जब डेटा अपनी प्रतिधारण अवधि के अंत तक पहुँच जाता है, तो इसे उद्योग-मानक विधियों का उपयोग करके सुरक्षित रूप से हटा दिया जाता है जो यह सुनिश्चित करते हैं कि डेटा को पुनर्प्राप्त नहीं किया जा सकता है।

## 7. घटना प्रतिक्रिया
हम किसी भी संभावित सुरक्षा उल्लंघन को संबोधित करने के लिए एक मजबूत घटना प्रतिक्रिया योजना (IRP) बनाए रखते हैं, जिसमें पहचान, रोकथाम, उन्मूलन और पुनर्प्राप्ति चरण शामिल हैं। डेटा उल्लंघन की स्थिति में, हम लागू कानूनों के अनुसार प्रभावित उपयोगकर्ताओं और संबंधित अधिकारियों को सूचित करेंगे।
`;

export const DATA_RETENTION_POLICY_AR = `
# سياسة الاحتفاظ بالبيانات وأمنها

## 1. نظرة عامة
تحدد هذه السياسة التزامنا بتقليل البيانات وممارسات الاحتفاظ الآمنة، المصممة خصيصًا لتلبية متطلبات أمان Q11 من Plaid ومعايير حماية البيانات الدولية.

## 2. مبادئ الاحتفاظ
- **تحديد الغرض:** نحن نحتفظ فقط بالبيانات الضرورية لتقديم خدماتنا. **نحن نطلب فقط النطاقات المحددة من Plaid (المعاملات، الهوية، الرصيد) اللازمة لتوفير ميزات Ledger.**
- **تحديد التخزين:** يتم حذف البيانات بمجرد عدم الحاجة إليها لغرضها الأصلي.
- **الدقة:** نتخذ خطوات معقولة لضمان دقة البيانات التي نحتفظ بها وتحديثها.

## 3. فترات الاحتفاظ
- **بيانات المستخدم النشط:** يتم الاحتفاظ بها طوال مدة حسابك النشط.
- **سجل المعاملات:** يتم الاحتفاظ به لمدة تصل إلى 7 سنوات لأغراض الضريبة والامتثال، أو حتى حذف الحساب.
- **سجلات التدقيق:** يتم الاحتفاظ بها لمدة 12 شهرًا لضمان الأمن والمساءلة.
- **بيانات النسخ الاحتياطي:** يتم الاحتفاظ بالنسخ الاحتياطية المشفرة لمدة 30 يومًا قبل الكتابة فوقها بشكل دائم.

## 4. الحذف الفوري (الامتثال لـ Plaid Q11)
نحن نطبق بروتوكولات حذف صارمة للبيانات المالية:
- **إنهاء الحساب:** عندما ينهي المستخدم حسابه، يتم حذف جميع السجلات المالية المرتبطة وسجل المعاملات ومعلومات التعريف الشخصية (PII) نهائيًا من أنظمة الإنتاج لدينا في غضون 24 ساعة.
- **إلغاء ربط البنك:** إذا قام المستخدم بإلغاء ربط مؤسسة مالية معينة، فسيتم حذف جميع البيانات المستردة من تلك المؤسسة على الفور.

## 5. الضوابط الأمنية
- **البنية التحتية:** تقع جميع البيانات داخل بيئة Google Cloud Platform الآمنة.
- **التشفير:** يتم تطبيق تشفير AES-256 على جميع البيانات عند السكون.
- **إدارة الثغرات الأمنية:** نقوم بإجراء فحص آلي للحاويات وعمليات تدقيق أمنية منتظمة.
- **التدقيق و MFA:** نحن نحتفظ بسجلات تدقيق غير قابلة للتغيير لجميع عمليات الوصول الإداري وتغييرات النظام الحرجة لضمان المساءلة. تم تمكين المصادقة متعددة العوامل (MFA) لجميع عمليات الوصول الإداري إلى Google Cloud Console وهي متاحة لجميع المستخدمين النهائيين عبر Firebase Authentication.
- **أمن الشبكة:** نستخدم السحب الخاصة الافتراضية (VPC) وجدران الحماية لعزل بيئات الإنتاج.

## 6. التخلص من البيانات
عندما تصل البيانات إلى نهاية فترة الاحتفاظ بها، يتم حذفها بأمان باستخدام طرق قياسية في الصناعة تضمن عدم إمكانية استرداد البيانات.

## 7. الاستجابة للحوادث
نحن نحتفظ بخطة قوية للاستجابة للحوادث (IRP) لمعالجة أي انتهاكات أمنية محتملة، بما في ذلك مراحل التحديد والاحتواء والاستئصال والاسترداد. في حالة حدوث خرق للبيانات، سنقوم بإخطار المستخدمين المتضررين والسلطات المختصة وفقًا للقوانين المعمول بها.
`;
