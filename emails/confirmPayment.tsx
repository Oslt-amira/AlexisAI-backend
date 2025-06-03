import {
  Body,
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
  Column,
  Row,
} from '@react-email/components';
import * as React from 'react';

interface PaymentConfirmationEmailProps {
  name: string;
  startDate: Date;
  endDate: Date;
  paymentId: string;
  paymentMethod: string;
}

export const PaymentConfirmationEmail = ({
  name,
  startDate,
  endDate,
  paymentId,
  paymentMethod,
}: PaymentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your subscription is active.</Preview>
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
          Congrats <strong>{name} !</strong>
        </Heading>
        <Text style={paragraph}>
          We're thrilled to welcome you to Alexis! Your subscription for exam
          prep is now confirmed, and you're ready to conquer those finals.
        </Text>
        <Text style={paragraph}>
          <strong>Start date :</strong>{' '}
          {startDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={paragraph}>
          <strong>End date :</strong>{' '}
          {endDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Heading style={heading}>Billing details</Heading>
        <Text style={paragraph}>
          <strong>Plan :</strong> Alexis Pro
        </Text>
        <Text style={paragraph}>
          <strong>Payment method :</strong> {paymentMethod}
        </Text>
        <Text style={paragraph}>
          <strong>Total paid :</strong> 20 TND
        </Text>
        {/* <Heading style={heading}>Here's what you can look forward to :</Heading> */}
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

export default PaymentConfirmationEmail;

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

const billingSection = {
  display: 'flex',
  flexDirection: 'column' as 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#ECEAEF',
  borderRadius: '3px',
  maxWidth: '560px',
  padding: '20px 50px',
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
};

const button = {
  backgroundColor: '#8e4ec6ed',
  borderRadius: '3px',
  fontWeight: '600',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '11px 23px',
};

const reportLink = {
  fontSize: '14px',
  color: '#b4becc',
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
};
