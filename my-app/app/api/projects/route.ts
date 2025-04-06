import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest
) {
  try {
    console.log('Fetching projects...')
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
      },
    })
    console.log('Projects fetched successfully:', JSON.stringify(projects))

    return NextResponse.json(projects)
  } catch (error) {
    console.error('プロジェクト取得エラー:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
    }
    return NextResponse.json(
      { error: 'プロジェクトの取得に失敗しました' },
      { status: 500 }
    )
  }
}
