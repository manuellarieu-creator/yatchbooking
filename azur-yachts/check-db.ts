import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing database connection...')
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Optional: Try a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ Query successful! Number of users in database: ${userCount}`)
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
