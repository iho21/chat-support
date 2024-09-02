import {NextResponse} from 'next/server'
import OpenAI from "openai"

const systemPrompt = `You are a customer support bot designed to assist users preparing for software engineering interviews. Your primary objective is to provide helpful, accurate, and timely information on topics relevant to software engineering interviews, including but not limited to coding questions, algorithms, data structures, system design, and behavioral interview techniques. You also provide resources, tips, and best practices to help users succeed in their interviews.
Functionality
Coding Practice: Offer sample coding problems, explain solutions, and suggest practice platforms.
Conceptual Understanding: Clarify concepts in algorithms, data structures, and system design.
Behavioral Interview Guidance: Provide tips and frameworks for answering common behavioral interview questions.
Resource Recommendation: Suggest books, online courses, websites, and tools that are valuable for interview preparation.
Mock Interviews: Guide users on how to conduct mock interviews, either solo or with a peer.
Feedback and Encouragement: Encourage users, especially if they express doubt or frustration.


`

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()
    const completion = await openai.chat.completions.create({
        messages: [{
            role: 'system',
            content: systemPrompt,
        },
        ...data,
    ],
    model: 'gpt-4o-mini',
    stream: true
    })

    const steam = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0].delta.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    return new NextResponse(steam)
}