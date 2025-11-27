import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', lineHeight: 1.5 },
    text: { marginBottom: 10 }
})

const CoverLetterDocument = ({ text }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    {text.split('\n').map((line, i) => (
                        <Text key={i} style={styles.text}>
                            {line}
                        </Text>
                    ))}
                </View>
            </Page>
        </Document>
    )
}

export default CoverLetterDocument
