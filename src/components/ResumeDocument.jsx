import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Base styles common to all templates
const baseStyles = StyleSheet.create({
    page: { padding: 20, fontSize: 10, color: '#333', fontFamily: 'Helvetica' },
    bullet: { marginLeft: 8, fontSize: 10, color: '#444' }
})

// 1. Classic Template
const classicStyles = StyleSheet.create({
    ...baseStyles,
    header: { borderBottom: 1, borderBottomColor: '#ccc', paddingBottom: 10, marginBottom: 15, textAlign: 'center' },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    contact: { fontSize: 9, color: '#666', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    section: { marginBottom: 12 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', borderBottom: 1, borderBottomColor: '#eee', paddingBottom: 2, marginBottom: 6, textTransform: 'uppercase' },
    entryTitle: { fontWeight: 'bold', fontSize: 11 },
    entrySubtitle: { fontSize: 10, fontStyle: 'italic', color: '#555' },
    entryDate: { fontSize: 9, color: '#777' },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }
})

// 2. Modern Template (Sidebar)
const modernStyles = StyleSheet.create({
    page: { flexDirection: 'row', backgroundColor: '#FFF' },
    sidebar: { width: '30%', backgroundColor: '#f4f4f4', padding: 20, height: '100%' },
    main: { width: '70%', padding: 20 },
    name: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50' },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#2c3e50', textTransform: 'uppercase', marginBottom: 8, borderBottom: 1, borderBottomColor: '#ddd' },
    text: { fontSize: 9, marginBottom: 4, color: '#555' }
})

// 3. Clean Template (Minimalist)
const cleanStyles = StyleSheet.create({
    ...baseStyles,
    header: { marginBottom: 20 },
    name: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 2 },
    title: { fontSize: 14, color: '#666', marginBottom: 8 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#000', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }
})

// 4. Professional Template (Compact)
const professionalStyles = StyleSheet.create({
    ...baseStyles,
    page: { padding: 40, fontSize: 10 },
    header: { borderBottom: 2, borderBottomColor: '#333', paddingBottom: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    name: { fontSize: 20, fontWeight: 'bold' },
    contact: { fontSize: 9, textAlign: 'right' },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#eee', padding: 3, marginBottom: 6, marginTop: 10 },
    entryTitle: { fontWeight: 'bold' }
})

// 5. Stitch Template (Academic/Professional)
const stitchStyles = StyleSheet.create({
    page: { padding: 20, fontSize: 10, fontFamily: 'Times-Roman', color: '#000' },
    header: { marginBottom: 10, textAlign: 'center' },
    name: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    contact: { fontSize: 10, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    section: { marginBottom: 8 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottom: 1,
        borderBottomColor: '#000',
        marginBottom: 6,
        paddingBottom: 2
    },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    entryTitle: { fontWeight: 'bold', fontSize: 10.5 },
    entryDate: { fontSize: 10.5, textAlign: 'right' },
    entrySubtitle: { fontSize: 10.5, fontStyle: 'italic', marginBottom: 2 },
    bullet: { fontSize: 10.5, marginLeft: 15, marginBottom: 2, lineHeight: 1.3 },
    skillCategory: { fontWeight: 'bold' }
})

const ResumeDocument = ({ resume, template = 'stitch' }) => {
    const styles = {
        modern: modernStyles,
        clean: cleanStyles,
        professional: professionalStyles,
        classic: classicStyles,
        stitch: stitchStyles
    }[template] || stitchStyles

    // Helper for contact info array
    const contactInfo = [
        resume.personalInfo?.location,
        resume.personalInfo?.phone,
        resume.personalInfo?.email,
        resume.personalInfo?.linkedin,
        resume.personalInfo?.github
    ].filter(Boolean).join(' | ')

    // Safely get sections
    const getSection = (id) => resume.sections?.find(s => s.id === id) || {}

    // --- TEMPLATE RENDERERS ---

    if (template === 'stitch') {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.name}>{resume.personalInfo?.name}</Text>
                        <Text style={styles.contact}>{contactInfo}</Text>
                    </View>

                    {/* Dynamic Sections */}
                    {resume.sections?.map(section => {
                        const type = section.type || section.id

                        // Summary
                        if (type === 'summary' || section.id === 'summary') {
                            return section.content ? (
                                <View key={section.id} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Text style={{ lineHeight: 1.3 }}>
                                        {typeof section.content === 'object' ? (section.content.content || '') : section.content}
                                    </Text>
                                </View>
                            ) : null
                        }

                        // Education
                        if (type.includes('education') || section.id === 'education') {
                            return section.items ? (
                                <View key={section.id} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.items.map((item, i) => (
                                        <View key={i} style={{ marginBottom: 4 }}>
                                            <View style={styles.entryHeader}>
                                                <Text style={styles.entryTitle}>{item.school}</Text>
                                                <Text style={styles.entryDate}>{item.year}</Text>
                                            </View>
                                            <View style={styles.entryHeader}>
                                                <Text style={styles.entrySubtitle}>{item.degree}</Text>
                                                <Text style={styles.entrySubtitle}>{item.location}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : null
                        }

                        // Experience
                        if (type.includes('experience') || section.id === 'experience') {
                            return section.items ? (
                                <View key={section.id} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.items.map((item, i) => (
                                        <View key={i} style={{ marginBottom: 8 }}>
                                            <View style={styles.entryHeader}>
                                                <Text style={styles.entryTitle}>{item.role} | {item.company}</Text>
                                                <Text style={styles.entryDate}>{item.startDate} - {item.endDate}</Text>
                                            </View>
                                            {item.bullets?.map((b, j) => (
                                                <View key={j} style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontSize: 10.5, marginRight: 5 }}>•</Text>
                                                    <Text style={{ fontSize: 10.5, flex: 1, lineHeight: 1.3 }}>{b}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            ) : null
                        }

                        // Projects
                        if (type.includes('projects') || section.id === 'projects') {
                            return section.items ? (
                                <View key={section.id} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.items.map((item, i) => (
                                        <View key={i} style={{ marginBottom: 6 }}>
                                            <Text style={styles.entryTitle}>{item.title}</Text>
                                            <Text style={{ fontSize: 10.5, marginBottom: 2 }}>{item.description}</Text>
                                            {item.technologies && (
                                                <Text style={{ fontSize: 10.5, fontStyle: 'italic' }}>
                                                    Technologies: {item.technologies.join(', ')}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ) : null
                        }

                        // Skills
                        if (type.includes('skills') || section.id === 'skills') {
                            return section.items ? (
                                <View key={section.id} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Text style={{ fontSize: 10.5, lineHeight: 1.4 }}>
                                        {Array.isArray(section.items)
                                            ? section.items.map(item => {
                                                if (typeof item === 'object' && item !== null) {
                                                    return item.name || item.label || item.value || item.skill || '';
                                                }
                                                return item;
                                            }).filter(Boolean).join(', ')
                                            : section.items}
                                    </Text>
                                </View>
                            ) : null
                        }

                        // Generic / Custom
                        if (section.items) {
                            return (
                                <View key={section.id} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    {section.items.map((item, i) => (
                                        <View key={i} style={{ marginBottom: 6 }}>
                                            <View style={styles.entryHeader}>
                                                <Text style={styles.entryTitle}>{item.title || item.degree}</Text>
                                                <Text style={styles.entryDate}>{item.year}</Text>
                                            </View>
                                            <Text style={styles.entrySubtitle}>{item.school || item.subtitle}</Text>
                                            {item.description && <Text style={{ fontSize: 10, marginTop: 2 }}>{item.description}</Text>}
                                        </View>
                                    ))}
                                </View>
                            )
                        }

                        return null
                    })}

                    {/* Summary (Optional, at bottom or top? User image didn't show summary, but we have it. Let's put it at top if exists, or omit if strictly following image. Let's keep it but maybe minimal) */}
                    {/* Actually, standard academic resumes often omit summary or put it at top. Let's put it at top if it exists. */}
                </Page>
            </Document>
        )
    }

    if (template === 'modern') {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.sidebar}>
                        <Text style={styles.name}>{resume.personalInfo?.name}</Text>
                        <Text style={{ fontSize: 12, marginBottom: 15, color: '#555' }}>{resume.personalInfo?.title}</Text>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.sectionTitle}>Contact</Text>
                            <Text style={styles.text}>{resume.personalInfo?.email}</Text>
                            <Text style={styles.text}>{resume.personalInfo?.phone}</Text>
                            <Text style={styles.text}>{resume.personalInfo?.location}</Text>
                        </View>

                        <View>
                            <Text style={styles.sectionTitle}>Skills</Text>
                            {getSection('skills').items?.map((skill, i) => (
                                <Text key={i} style={styles.text}>• {skill}</Text>
                            ))}
                        </View>
                    </View>

                    <View style={styles.main}>
                        {getSection('summary').content && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={styles.sectionTitle}>Profile</Text>
                                <Text style={{ fontSize: 10, lineHeight: 1.4 }}>
                                    {typeof getSection('summary').content === 'object' ? (getSection('summary').content.content || '') : getSection('summary').content}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.sectionTitle}>Experience</Text>
                        {getSection('experience').items?.map((exp, i) => (
                            <View key={i} style={{ marginBottom: 10 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{exp.role}</Text>
                                <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#555' }}>{exp.company} | {exp.startDate} - {exp.endDate}</Text>
                                {exp.bullets?.map((b, j) => <Text key={j} style={{ fontSize: 9, marginLeft: 5, color: '#444' }}>• {b}</Text>)}
                            </View>
                        ))}
                    </View>
                </Page>
            </Document>
        )
    }

    if (template === 'professional') {
        return (
            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.name}>{resume.personalInfo?.name}</Text>
                            <Text style={{ fontSize: 12 }}>{resume.personalInfo?.title}</Text>
                        </View>
                        <View style={styles.contact}>
                            <Text>{resume.personalInfo?.email}</Text>
                            <Text>{resume.personalInfo?.phone}</Text>
                            <Text>{resume.personalInfo?.location}</Text>
                        </View>
                    </View>

                    {resume.sections?.map(section => (
                        <View key={section.id} wrap={false}>
                            {section.id !== 'personal' && <Text style={styles.sectionTitle}>{section.title?.toUpperCase()}</Text>}

                            {section.id === 'summary' && (
                                <Text style={{ marginBottom: 5 }}>
                                    {typeof section.content === 'object' ? (section.content.content || '') : section.content}
                                </Text>
                            )}

                            {section.id === 'skills' && (
                                <Text>{Array.isArray(section.items) ? section.items.join(' • ') : ''}</Text>
                            )}

                            {section.id === 'experience' && section.items?.map((item, i) => (
                                <View key={i} style={{ marginBottom: 8 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.entryTitle}>{item.role}</Text>
                                        <Text style={{ fontSize: 9 }}>{item.startDate} - {item.endDate}</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, fontStyle: 'italic' }}>{item.company}, {item.location}</Text>
                                    {item.bullets?.map((b, j) => <Text key={j} style={{ fontSize: 9, marginLeft: 10 }}>• {b}</Text>)}
                                </View>
                            ))}

                            {/* Fallback for other sections */}
                            {(section.id !== 'summary' && section.id !== 'skills' && section.id !== 'experience' && section.items) && section.items.map((item, i) => (
                                <View key={i} style={{ marginBottom: 6 }}>
                                    <Text style={styles.entryTitle}>{item.title || item.degree}</Text>
                                    <Text style={{ fontSize: 10 }}>{item.school || item.subtitle}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </Page>
            </Document>
        )
    }

    // Default / Classic / Clean Layout
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={template === 'clean' ? styles.header : classicStyles.header}>
                    <Text style={styles.name}>{resume.personalInfo?.name}</Text>
                    {template === 'clean' && <Text style={styles.title}>{resume.personalInfo?.title}</Text>}
                    <Text style={styles.contact}>{contactInfo}</Text>
                </View>

                {resume.sections?.map(section => {
                    if (section.id === 'summary') {
                        return (
                            <View key={section.id} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={{ lineHeight: 1.4 }}>
                                    {typeof section.content === 'object' ? (section.content.content || '') : section.content}
                                </Text>
                            </View>
                        )
                    }
                    if (section.id === 'skills') {
                        return (
                            <View key={section.id} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text>{Array.isArray(section.items) ? section.items.join(' • ') : ''}</Text>
                            </View>
                        )
                    }
                    if (section.id === 'experience') {
                        return (
                            <View key={section.id} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                {section.items?.map((item, i) => (
                                    <View key={i} style={{ marginBottom: 8 }}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{item.role}</Text>
                                            <Text style={styles.entryDate}>{item.startDate} - {item.endDate}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>{item.company}, {item.location}</Text>
                                        {item.bullets?.map((b, j) => (
                                            <Text key={j} style={{ fontSize: 10, marginLeft: 12, marginTop: 2 }}>• {b}</Text>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        )
                    }
                    // Generic fallback for Education, Projects
                    if (section.items) {
                        return (
                            <View key={section.id} style={styles.section}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                {section.items.map((item, i) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{item.title || item.degree}</Text>
                                            <Text style={styles.entryDate}>{item.year}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>{item.school || item.subtitle}</Text>
                                        {item.description && <Text style={{ fontSize: 10, marginTop: 2 }}>{item.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )
                    }
                    return null
                })}
            </Page>
        </Document>
    )
}

export default ResumeDocument
