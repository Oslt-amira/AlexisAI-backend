import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export const SubsciptionExpiryEmail = () => (
  <Html>
    <Head />
    <Preview>Your login link for Alexis</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          alt="Alexis"
          src={`${process.env.FRONTEND_BASE_URL}/logo.png`}
          style={{
            margin: '0 auto',
          }}
          width={110}
          height={110}
        />
        <Heading style={heading}>
          Sadly, your Alexis subscription has expired.
        </Heading>
        <Text style={paragraph}>
          You're now back to the free plan. If you want to continue using the
          Pro features,
          <strong>
            you can renew your subscription by signing in and going to the
            billing section.
          </strong>
        </Text>
        <Section style={buttonContainer}>
          <Button
            style={button}
            href={`${process.env.FRONTEND_BASE_URL}/signIn`}
          >
            Login to Alexis
          </Button>
        </Section>

        <Hr style={hr} />
        <Link href="https://heyalexis.app" style={reportLink}>
          Alexis
        </Link>
        <Text
          style={{
            ...paragraph,
            margin: '0 auto',
            color: '#b4becc',
            fontSize: '14px',
            fontWeight: 'normal',
          }}
        >
          Tunis, Tunisia at{' '}
          {new Date().toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SubsciptionExpiryEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '20px 0 0',
};

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
};

const buttonContainer = {
  padding: '27px 0 27px',
  width: 'auto',
};

const button = {
  backgroundColor: '#8e4ec6ed',
  borderRadius: '3px',
  fontWeight: '600',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '11px 23px',
  width: 'auto',
};

const reportLink = {
  fontSize: '14px',
  color: '#b4becc',
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
};
